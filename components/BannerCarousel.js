import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Dimensions, Image, Pressable, StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { AppContext } from "./../ContextAPI/ContextAPI";

import { VideoView, useVideoPlayer } from 'expo-video'; // Expo video
import YoutubePlayer from "react-native-youtube-iframe"; // YouTube player

const { width: screenWidth } = Dimensions.get("window");
const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/banners`;

export default function BannerCarousel({ navigation }) {
  const { apiToken, accessTokens, onGenerateToken } =
    useContext(AppContext);

  const [banners, setBanners] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
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
          setBanners(response.data.banners.filter(b => b && b.file_path));
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

  const VideoItem = ({ item, index, activeSlide }) => {
    const player = useVideoPlayer(item.file_path, (playerInstance) => {
      if (playerInstance) {
        playerInstance.loop = true;
      }
    });

    useEffect(() => {
      if (player) {
        if (activeSlide === index) {
          player.play();
        } else {
          player.pause();
        }
      }
    }, [activeSlide, index, player]);

    return player ? <VideoView player={player} style={styles.banner} contentFit="cover" fullscreenOptions={{}} /> : null;
  };

  const handleBannerPress = (item) => {
    if (item.link_type === 'product') {
      navigation.navigate('ProductDetailsScreen', { product: { id: item.link_id } });
    } else if (item.link_type === 'category') {
      navigation.navigate('ProductListScreen', { categoryId: item.link_id });
    }
  };

  return (
    <View style={styles.carouselContainer}>
      <Carousel
        loop
        width={screenWidth - 40}
        height={160}
        autoPlay
        autoPlayInterval={5000}
        pagingEnabled
        snapEnabled
        data={banners}
        defaultScrollOffsetValue={scrollOffsetValue}
        onSnapToItem={(index) => {
          setActiveSlide(index);
        }}
        renderItem={({ item, index }) => (
          <Pressable style={styles.slide} onPress={item.media_type !== 'video' && item.file_path ? () => handleBannerPress(item) : undefined}>
            {item.media_type === "image" && item.file_path && (
              <Image source={{ uri: item.file_path }} style={styles.banner} />
            )}

            {item.media_type === "video" && item.file_path && (
              <VideoItem item={item} index={index} activeSlide={activeSlide} />
            )}

            {item.media_type === "youtube" && item.file_path && getYouTubeId(item.file_path) && (
              <YoutubePlayer
                height={160}
                play={activeSlide === index}
                videoId={getYouTubeId(item.file_path)}
              />
            )}
          </Pressable>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    height: 200,
    marginTop: 30,
    paddingLeft: 20,
    paddingRight: 20,
  },
  banner: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
