import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { AppContext } from "./../ContextAPI/ContextAPI";

import { Video } from "expo-av"; // Expo video
import YoutubePlayer from "react-native-youtube-iframe"; // YouTube player

const { width: screenWidth } = Dimensions.get("window");
const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/banners`;

export default function BannerCarousel() {
  const { apiToken, accessTokens, onGenerateToken } =
    useContext(AppContext);

  const [banners, setBanners] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const videoRefs = useRef({});
  const scrollOffsetValue = useSharedValue(0);

  useEffect(() => {
    const fetchBannerCarousel = async () => {
      try {
        const response = await axios.get(`${API_URL}`, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "X-User-Token": `Bearer ${accessTokens}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.statusCode === 200) {
          setBanners(response.data.banners);
        }
      } catch (error) {
        console.error(
          "Error fetching banners:",
          error.response?.data || error.message
        );
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("apiToken");
          onGenerateToken(true);
        }
      }
    };

    if (apiToken && accessTokens) {
      fetchBannerCarousel();
    }
  }, [apiToken, accessTokens, onGenerateToken]);

  const getYouTubeId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <View style={styles.carouselContainer}>
      <Carousel
        loop
        width={screenWidth * 0.9}
        height={160}
        autoPlay
        autoPlayInterval={5000}
        pagingEnabled
        snapEnabled
        data={banners}
        defaultScrollOffsetValue={scrollOffsetValue}
        onSnapToItem={(index) => {
          setActiveSlide(index);

          // pause all videos except the current one
          Object.keys(videoRefs.current).forEach((key) => {
            const ref = videoRefs.current[key];
            if (ref && ref.pauseAsync && key !== index.toString()) {
              ref.pauseAsync();
            }
          });
        }}
        renderItem={({ item, index }) => (
          <View style={styles.slide}>
            {item.media_type === "image" && (
              <Image source={{ uri: item.file_path }} style={styles.banner} />
            )}

            {item.media_type === "video" && (
              <Video
                ref={(ref) => {
                  if (ref) {
                    videoRefs.current[index.toString()] = ref;
                  }
                }}
                source={{ uri: item.file_path }}
                style={styles.banner}
                useNativeControls
                resizeMode="cover"
                isLooping
                shouldPlay={activeSlide === index}
              />
            )}

            {item.media_type === "youtube" && (
              <YoutubePlayer
                height={160}
                play={activeSlide === index}
                videoId={getYouTubeId(item.file_path)}
              />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    height: 160,
    marginTop: 30,
    paddingLeft: 20,
    paddingRight: 20,
  },
  banner: {
    width: "100%",
    height: 160,
    borderRadius: 8,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
