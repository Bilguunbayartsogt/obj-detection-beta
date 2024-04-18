import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Platform, Button } from "react-native";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as cocossd from "@tensorflow-models/coco-ssd";

import { useEffect, useState } from "react";

import { Camera, CameraType } from "expo-camera";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";

const TensorCamera = cameraWithTensors(Camera);

export default function App() {
	const [type, setType] = useState(CameraType.back);
	const [permission, requestPermission] = Camera.useCameraPermissions();
	const [model, setModel] = useState();
	const [isModelLoaded, setIsModelLoaded] = useState(false);
	const [prediction, setPrediction] = useState("");

	useEffect(() => {
		const loadModel = async () => {
			try {
				await tf.ready();
				console.log("tf ready");
				const loadedMobilenet = await mobilenet.load();
				console.log("mobilenet ready");
				// const loadedCoco = await cocossd.load();
				// console.log("coco loaded");
				setModel(loadedMobilenet);
				setIsModelLoaded(true);
			} catch (err) {
				console.log(err);
			}
			// Set the loaded model to your component's state or a class property
		};

		loadModel();
	}, []);

	if (!permission) {
		// Camera permissions are still loading
		return <View />;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet
		return (
			<View style={styles.container}>
				<Text style={{ textAlign: "center" }}>
					We need your permission to show the camera
				</Text>
				<Button onPress={requestPermission} title="grant permission" />
			</View>
		);
	}

	let textureDims;
	if (Platform.OS === "ios") {
		textureDims = {
			height: 1920,
			width: 1080,
		};
	} else {
		textureDims = {
			height: 1200,
			width: 1600,
		};
	}

	function handleCameraStream(images, updatePreview, gl) {
		const loop = async () => {
			const nextImageTensor = images.next().value;
			// const predictions = await model.detect(nextImageTensor);
			const predictions = await model.classify(nextImageTensor);
			setPrediction(predictions.map((obj) => obj.className));
			tf.dispose([nextImageTensor]);
			// if (predictions[0]) {
			// 	setPrediction(prediction[0].class);
			// }
			// console.log(predictions);
			// if (predictions[0]["probability"] >= 0.66) {
			// 	setPrediction(predictions[0]["className"]);
			// }
			// do something with tensor here
			//

			// if autorender is false you need the following two lines.
			// updatePreview();
			// gl.endFrameEXP();

			requestAnimationFrame(loop);
		};
		loop();
	}

	return (
		<View style={styles.container}>
			<View style={styles.statusContainer}>
				<Text style={styles.modelStatus}>
					{!isModelLoaded ? "Model Loading..." : "Model Loaded"}
				</Text>
				<Text style={styles.modelStatus}>Prediction: {prediction}</Text>
			</View>
			{isModelLoaded ? (
				<TensorCamera
					style={styles.camera}
					type={type}
					cameraTextureHeight={1200}
					cameraTextureWidth={1600}
					resizeHeight={200}
					resizeWidth={152}
					resizeDepth={3}
					onReady={handleCameraStream}
					autorender={true}
				/>
			) : (
				<View style={{ flex: 8 }}>
					<Text>Model Loading...</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
	},
	statusContainer: {
		flex: 1,
		marginTop: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	modelStatus: {
		fontSize: 10,
	},
	camera: {
		flex: 8,
	},
});
