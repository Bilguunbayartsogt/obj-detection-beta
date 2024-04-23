import { Text, View, Button, TouchableOpacity } from "react-native";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import * as cocossd from "@tensorflow-models/coco-ssd";

import { useEffect, useState } from "react";

import { Camera, CameraType } from "expo-camera";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";

const TensorCamera = cameraWithTensors(Camera);

//import styles
import { styles } from "./styles";

//import custom components
import { ObjectBox } from "./components/object-box";

//import functions
import { getPermission } from "./functions/get-permission";

//import configs
import { textureDims } from "./configs/textureDims";

//main app
export default function App() {
	//camera type: back or front
	const [type, setType] = useState(CameraType.back);
	//device camera permission
	const [permission, requestPermission] = Camera.useCameraPermissions();
	//for storing the model
	const [model, setModel] = useState();
	//check if model is loaded or not to display different elements
	const [isModelLoaded, setIsModelLoaded] = useState(false);
	//predictions from the loaded model
	const [predictions, setPredictions] = useState("");

	//get user permission and load the model
	useEffect(() => {
		const loadModel = async () => {
			getPermission(permission, requestPermission);
			try {
				await tf.ready();
				console.log("tf ready");
				const loadedCoco = await cocossd.load();
				console.log("coco loaded");
				setModel(loadedCoco);
				setIsModelLoaded(true);
			} catch (err) {
				console.log(`Error loading the model: ${err}`);
			}
		};
		loadModel();
	}, []);

	//the main loop function for continiously extracting tensors from the camera stream
	function handleCameraStream(images, updatePreview, gl) {
		const loop = async () => {
			const nextImageTensor = images.next().value;
			const predictions = await model.detect(nextImageTensor);
			setPredictions(predictions);
			// console.log(predictions);

			//dispose the frame after the prediction is done
			tf.dispose([nextImageTensor]);

			requestAnimationFrame(loop);
		};
		loop();
	}

	//function for changing the camera type
	function toggleCameraType() {
		setType((current) =>
			current === CameraType.back ? CameraType.front : CameraType.back
		);
	}

	//function for displaying the prediction results to the user
	function displayBoxes(predictions) {
		if (predictions.length > 0) {
			return predictions.map((prediction, index) => {
				if (prediction.score > 0.66) {
					return (
						<ObjectBox
							key={index}
							class={prediction.class}
							score={prediction.score}
							marginLeft={Math.round(prediction.bbox[0]) * 3}
							marginTop={Math.round(prediction.bbox[1]) * 3}
							width={Math.round(prediction.bbox[2]) * 3}
							height={Math.round(prediction.bbox[3]) * 3}
						/>
					);
				}
				return null;
			});
		}
		return null;
	}

	return (
		<View style={styles.container}>
			{/* <View style={styles.statusContainer}>
				<Text style={styles.modelStatus}>
					{!isModelLoaded ? "Model Loading..." : "Model Loaded"}
				</Text>
				<Text style={styles.modelStatus}>Prediction: {prediction}</Text>
			</View> */}
			{isModelLoaded ? (
				<>
					<TensorCamera
						style={styles.camera}
						type={type}
						zoom={0.0005}
						cameraTextureHeight={textureDims.height}
						cameraTextureWidth={textureDims.width}
						resizeHeight={200}
						resizeWidth={152}
						resizeDepth={3}
						onReady={handleCameraStream}
						autorender={true}
						useCustomShadersToResize={false}
					/>
					{displayBoxes(predictions)}
					<View style={styles.buttonContainer}>
						<TouchableOpacity style={styles.button} onPress={toggleCameraType}>
							<Text style={styles.text}>Flip Camera</Text>
						</TouchableOpacity>
					</View>
				</>
			) : (
				<View style={{ flex: 8 }}>
					<Text>Model Loading...</Text>
				</View>
			)}
		</View>
	);
}
