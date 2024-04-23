import { View, Text, Button } from "react-native";

export function getPermission(permission, requestPermission) {
	if (!permission) {
		return <View />;
	}

	if (!permission.granted) {
		return (
			<View style={{ flex: 1, justifyContent: "center" }}>
				<Text style={{ textAlign: "center" }}>
					We need your permission to show the camera
				</Text>
				<Button onPress={requestPermission} title="grant permission" />
			</View>
		);
	}
}
