import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	boxes: {
		position: "absolute",
	},
	boxContainer: {
		position: "absolute",
		borderWidth: 5,
		borderColor: "green",
	},
	boxText: {
		fontSize: 20,
		color: "black",
	},
	container: {
		flex: 1,
		// justifyContent: "center",
	},
	modelStatus: {
		flex: 1,
		padding: 10,
		justifyContent: "flex-end",
		alignItems: "center",
	},
	modelStatusText: {
		fontSize: 20,
	},
	camera: {
		flex: 10,
	},
	buttonContainer: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: "transparent",
		justifyContent: "center",
		alignItems: "center",
	},
	button: {
		flex: 1,
		alignItems: "center",
	},
	text: {
		fontSize: 24,
		fontWeight: "bold",
		color: "black",
	},
});
