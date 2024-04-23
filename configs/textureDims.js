import { Platform } from "react-native";

export let textureDims;
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
