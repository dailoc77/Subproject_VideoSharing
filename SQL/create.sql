-- Tạo database
CREATE DATABASE db_videosharingapp;

-- Sử dụng database
USE db_videosharingapp;

-- Tạo bảng Users
CREATE TABLE Users (
    idUser INT AUTO_INCREMENT PRIMARY KEY,        -- Tự động tăng
    username VARCHAR(100) NOT NULL,              -- Tên người dùng
    sdt VARCHAR(15),                              -- Số điện thoại
    birthDay DATE,                                -- Ngày sinh
    avatar VARCHAR(255),                          -- Đường dẫn ảnh đại diện
    email VARCHAR(255) NOT NULL                  -- Email
);

-- Tạo bảng Account
CREATE TABLE Account (
    idAccount INT AUTO_INCREMENT PRIMARY KEY,    -- Tự động tăng
    idUser INT NOT NULL,                         -- Khóa ngoại từ bảng Users
    username VARCHAR(100) NOT NULL,             -- Tên người dùng
    pass VARCHAR(255) NOT NULL,                  -- Mật khẩu
    FOREIGN KEY (idUser) REFERENCES Users(idUser)
);

-- Tạo bảng Follow
CREATE TABLE Follow (
    id_following INT NOT NULL,                   -- id người dùng theo dõi
    id_followed INT NOT NULL,                    -- id người dùng bị theo dõi
    PRIMARY KEY (id_following, id_followed),     
    FOREIGN KEY (id_following) REFERENCES Users(idUser),
    FOREIGN KEY (id_followed) REFERENCES Users(idUser)
);

-- Tạo bảng Post
CREATE TABLE Post (
    idPost INT AUTO_INCREMENT PRIMARY KEY,       -- Tự động tăng
    idUser INT NOT NULL,                         -- id người dùng tạo bài đăng
    type VARCHAR(50),                            -- Loại bài đăng (video, image, story)
    url VARCHAR(255),                            -- Đường dẫn media (video, ảnh...)
    content VARCHAR(1000),                       -- Nội dung bài đăng
    upload_at DATETIME,                          -- Thời gian đăng
    FOREIGN KEY (idUser) REFERENCES Users(idUser)
);

-- Tạo bảng Like
CREATE TABLE `Like` (
    idLike INT AUTO_INCREMENT PRIMARY KEY,       -- Tự động tăng
    idUser INT NOT NULL,                         -- id người dùng thích bài đăng
    idPost INT NOT NULL,                         -- id bài đăng
    FOREIGN KEY (idUser) REFERENCES Users(idUser),
    FOREIGN KEY (idPost) REFERENCES Post(idPost)
);

-- Tạo bảng Comment
CREATE TABLE Comment (
    idComment INT AUTO_INCREMENT PRIMARY KEY,    -- Tự động tăng
    idPost INT NOT NULL,                         -- id bài đăng
    idUser INT NOT NULL,                         -- id người dùng bình luận
    text VARCHAR(1000),                          -- Nội dung bình luận
    time DATETIME,                               -- Thời gian bình luận
    FOREIGN KEY (idUser) REFERENCES Users(idUser),
    FOREIGN KEY (idPost) REFERENCES Post(idPost)
);
