import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	Platform,
	Button,
	TouchableOpacity,
} from "react-native";
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
	const [score, setScore] = useState();
	const [position, setPosition] = useState(null);

	useEffect(() => {
		const loadModel = async () => {
			try {
				await tf.ready();
				console.log("tf ready");
				// const loadedMobilenet = await mobilenet.load();
				// console.log("mobilenet ready");
				const loadedCoco = await cocossd.load();
				console.log("coco loaded");
				setModel(loadedCoco);
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
			const predictions = await model.detect(nextImageTensor);
			setPrediction(predictions.map((obj) => obj.class));
			setScore(predictions.map((obj) => parseFloat(obj.score) * 100));
			setPosition(
				predictions.map((obj) => {
					if (obj.bbox.length > 0) {
						console.log(obj.bbox);
						return obj.bbox;
					} else {
						return null;
					}
				})
			);
			// console.log(predictions.bbox);
			tf.dispose([nextImageTensor]);
			// if (predictions[0]) {
			// 	setPrediction(prediction[0].class);
			// }
			// console.log(predictions);
			// if (predictions[0]["probability"] >= 0.66) {
			// 	setPrediction(predictions[0]["className"]);
			// }

			// updatePreview();
			// gl.endFrameEXP();

			requestAnimationFrame(loop);
		};
		loop();
	}

	function toggleCameraType() {
		setType((current) =>
			current === CameraType.back ? CameraType.front : CameraType.back
		);
	}

	function displayBoxes(prediction, score, position) {
		if (prediction !== "" && position !== null) {
			return (
				<ObjectBox
					prediction={prediction}
					score={score}
					position={position}
				></ObjectBox>
			);
		} else {
			return "";
		}
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
				<>
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
						useCustomShadersToResize={false}
					/>
					{score > 65 ? displayBoxes(prediction, score) : ""}
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

function ObjectBox(props) {
	return (
		<View
			style={[
				styles.boxContainer,
				{
					marginLeft: props.position[0],
					marginTop: props.position[1],
				},
			]}
		>
			<Text style={styles.boxText}>
				{props.prediction} with {Math.round(props.score)}% confidence at{" "}
				{props.position}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	boxContainer: {
		position: "absolute",
		borderWidth: 5,
		borderColor: "green",
		top: 0,
		left: 0,
	},
	boxText: {
		fontSize: 40,
	},
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
		flex: 10,
	},
	buttonContainer: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: "transparent",
		margin: 40,
	},
	button: {
		flex: 1,
		alignSelf: "flex-end",
		alignItems: "center",
	},
	text: {
		fontSize: 24,
		fontWeight: "bold",
		color: "black",
	},
});
