import { styles } from "../styles";
import { Text, View } from "react-native";

export function ObjectBox(props) {
	return (
		<View
			style={{
				left: props.marginLeft,
				top: props.marginTop,
				width: props.width,
				height: props.height,
				position: "absolute",
				borderWidth: 2,
				borderColor: "#fff",
				backgroundColor: "rgba(0, 255, 0, 0.25)",
				flex: 1,
			}}
		>
			<Text style={styles.boxText}>
				{props.class} with {Math.round(props.score * 100)}% confidence
			</Text>
		</View>
	);
}
