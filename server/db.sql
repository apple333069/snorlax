SET NAMES UTF8;
DROP DATABASE IF EXISTS snorlax;
CREATE DATABASE snorlax CHARSET=UTF8;

-- 用戶登入表
USE snorlax;
CREATE TABLE snorlax_login(
  id INT PRIMARY KEY AUTO_INCREMENT,
  uname VARCHAR(50),
  upwd  VARCHAR(32)
);
CREATE TABLE snorlax_user(
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(32),
  user_img VARCHAR(255),
  gender TINYINT(1),
  birthday DATETIME,
  phone varchar(32) UNIQUE,
  user_address varchar(32),
  email varchar(255) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  user_pwd VARCHAR(32)
);
-- 用戶資料
INSERT INTO snorlax_user VALUES(null,'apple','02.png',0,'1999-01-01','0912345678','新北式','test@123','2021-08-08 08:08:08', '2021-08-08 08:08:08','2021-08-08 08:08:08',md5('123'));



CREATE TABLE snorlax_product(
  product_id INT PRIMARY KEY AUTO_INCREMENT,
  product_name VARCHAR(32),
  product_img VARCHAR(255),
  price INT(11),
  product_describe VARCHAR(255),
  category VARCHAR(32),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);

INSERT INTO snorlax_product VALUES(1,'美式咖啡','01.png',130,'高級咖啡豆','咖啡','2021-08-08 08:08:08', '2021-08-08 08:08:08','2021-08-08 08:08:08');


CREATE TABLE snorlax_user(
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(32),
  user_img VARCHAR(255),
  gender TINYINT(1),
  birthday DATETIME,
  phone varchar(32) UNIQUE,
  user_address varchar(32),
  email varchar(255) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);


CREATE TABLE snorlax_order(
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  product_id INT,
  user_name VARCHAR(32),
  re_date DATETIME, 
  order_status varchar(32),
  user_address varchar(32),
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  
	foreign key (user_address) references snorlax_user(user_address),
	foreign key (product_id) references snorlax_product(product_id),
	foreign key (user_id) references snorlax_user(user_id)
);

CREATE TABLE OrderProgress(
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT,
  order_id INT,
  progressName VARCHAR(32),
  created_at TIMESTAMP,
  foreign key (product_id) references snorlax_product(product_id),
  foreign key (order_id) references snorlax_order(order_id)
);

CREATE TABLE OrderDetail(
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT,
  order_id INT,
  unitprice INT(11),
  subsum INT(11),
  qty VARCHAR(32),
  foreign key (product_id) references snorlax_product(product_id),
  foreign key (order_id) references snorlax_order(order_id)
);