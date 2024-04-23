import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
