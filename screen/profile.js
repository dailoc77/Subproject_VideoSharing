import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import axios from "axios";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useNavigation } from "@react-navigation/native";

const BASE_URL = "http://192.168.1.6:3000"; // Dễ dàng chỉnh sửa khi cần

const MyVideos = ({ id, videos }) => {
  // Nhận videos từ props
  const navigation = useNavigation();

  return (
    <FlatList
      data={videos} // Dùng videos từ props
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.videoItem}
          onPress={() =>
            navigation.navigate("VideoDetails", {
              idPost: item.idPost,
              idUser: item.idUser,
              avatar: item.avatar,
            })
          }
        >
          <Image
            style={{ height: "100%", width: "100%", borderRadius: 10 }}
            source={{
              uri: "https://pngmagic.com/product_images/black-background-for-youtube-thumbnail.jpg",
            }}
          />
        </TouchableOpacity>
      )}
      keyExtractor={(item, index) => item.id?.toString() || `index-${index}`}
      numColumns={3}
      contentContainerStyle={{
        alignItems: "flex-start",
        marginTop: 10,
        justifyContent: "flex-start",
      }}
    />
  );
};

const MyImages = ({ id }) => {
  const [images, setImages] = useState([]);
  const navigation = useNavigation();

  const fetchData = async (id) => {
    if (!id) {
      console.log("ID không hợp lệ");
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/profileimages?id=${id}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setImages(response.data);
      } else {
        console.log("Không có ảnh nào được tìm thấy.");
        setImages([]); // Xử lý trường hợp không có dữ liệu
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  return (
    <FlatList
      data={images}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          key={item.id || index} // Truyền trực tiếp `key` vào JSX
          style={styles.videoItem}
          onPress={() =>
            navigation.navigate("ImageView", { imageUrl: item.url })
          }
        >
          <Image
            style={{ height: "100%", width: "100%", borderRadius: 10 }}
            source={{ uri: item.url }}
          />
        </TouchableOpacity>
      )}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      numColumns={3}
      contentContainerStyle={{
        alignItems: "flex-start",
        marginTop: 10,
        justifyContent: "flex-start",
      }}
    />
  );
};

const MyLiked = () => {
  return (
    <FlatList
      data={dataVideos}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.videoItem}>
          <Image source={item.image} />
        </TouchableOpacity>
      )}
      keyExtractor={(item, index) => item.id?.toString() || `index-${index}`}
      numColumns={3}
      contentContainerStyle={{ alignItems: "center", marginTop: 10 }}
    />
  );
};

const dataVideos = [
  { id: "1", image: require("../assets/MyProfile/Container80.png") },
  { id: "2", image: require("../assets/MyProfile/Container73.png") },
  { id: "3", image: require("../assets/MyProfile/Container74.png") },
  { id: "4", image: require("../assets/MyProfile/Container75.png") },
  { id: "5", image: require("../assets/MyProfile/Container76.png") },
  { id: "6", image: require("../assets/MyProfile/Container79.png") },
  { id: "7", image: require("../assets/MyProfile/Container77.png") },
  { id: "8", image: require("../assets/MyProfile/Container78.png") },
  { id: "9", image: require("../assets/MyProfile/Container72.png") },
];

const widthScreen = Dimensions.get("window").width;

const MyVideosTabView = ({ id, videos }) => {
  // Nhận videos từ props
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "videos", title: "My Videos" },
    { key: "images", title: "My Images" },
    { key: "liked", title: "Liked" },
  ]);

  const renderScene = SceneMap({
    videos: () => <MyVideos id={id} videos={videos} />, // Truyền videos vào đây
    images: () => <MyImages id={id} />,
    liked: MyLiked,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      renderLabel={({ route, focused }) => (
        <Text
          style={[
            styles.tabLabel,
            focused ? styles.activeTabLabel : styles.inactiveTabLabel,
          ]}
        >
          {route.title}
        </Text>
      )}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={{ width: widthScreen }}
    />
  );
};

export default function App({ navigation, route }) {
  const user = route.params.userData;
  const [videos, setVideos] = useState([]); // Giữ videos trong state

  const fetchData = async (id) => {
    try {
      if (!id) return;
      const response = await axios.get(`${BASE_URL}/profilevideos?id=${id}`);
      if (Array.isArray(response.data)) {
        setVideos(response.data);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    if (user?.idUser) {
      fetchData(user.idUser);
    }
  }, [user?.idUser]);

  return (
    <View style={styles.container}>
      <View style={styles.imgLogo}>
        <Image
          style={{ height: 150, width: 150, borderRadius: 150 }}
          source={{ uri: user?.avatar || "https://via.placeholder.com/150" }}
        />
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          {user?.username || "Unknown User"}
        </Text>
        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <TouchableOpacity
            style={styles.fl}
            onPress={() => navigation.navigate("Following", { user: user })}
          >
            <Text>{user?.following_count || 0}</Text>
            <Text style={styles.textgrey}>Following</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fl}
            onPress={() => navigation.navigate("Following", { user: user })}
          >
            <Text>{user?.followers_count || 0}</Text>
            <Text style={styles.textgrey}>Followers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fl}>
            <Text>6031</Text>
            <Text style={styles.textgrey}>Like</Text>
          </TouchableOpacity>
        </View>
      </View>
      <MyVideosTabView id={user} videos={videos} />{" "}
      {/* Truyền videos vào đây */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imgLogo: {
    alignItems: "center",
    marginTop: 30,
    paddingBottom: 20,
  },
  fl: {
    paddingHorizontal: 15,
    alignItems: "center",
  },
  textgrey: {
    color: "grey",
  },
  scene: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabViewContainer: {
    flexDirection: "row",
    marginTop: 20,
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  touchTabView: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  videoItem: {
    width: widthScreen / 3,
    padding: 15,
    height: 180,
    resizeMode: "contain",
  },
  scene: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: "white",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  indicator: {
    backgroundColor: "pink",
    height: 2,
  },
  tabLabel: {
    fontSize: 16,
  },
  activeTabLabel: {
    color: "pink",
  },
  inactiveTabLabel: {
    color: "black",
  },
});
