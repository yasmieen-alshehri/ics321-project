-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: ecommerce_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_tab`
--

DROP TABLE IF EXISTS `admin_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_tab` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `passwordd` varchar(50) NOT NULL,
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_tab`
--

LOCK TABLES `admin_tab` WRITE;
/*!40000 ALTER TABLE `admin_tab` DISABLE KEYS */;
INSERT INTO `admin_tab` VALUES (1,'Admin@2024!');
/*!40000 ALTER TABLE `admin_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_tab`
--

DROP TABLE IF EXISTS `customer_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_tab` (
  `c_username` varchar(50) NOT NULL,
  `passwordd` varchar(50) NOT NULL,
  `address` varchar(4000) NOT NULL,
  PRIMARY KEY (`c_username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_tab`
--

LOCK TABLES `customer_tab` WRITE;
/*!40000 ALTER TABLE `customer_tab` DISABLE KEYS */;
INSERT INTO `customer_tab` VALUES ('amira_khalid','Amira#456','Dubai, UAE'),('layla_mohammed','Layla@2024!','Riyadh, Saudi Arabia'),('nadia_ibrahim','Nadia$789','Cairo, Egypt');
/*!40000 ALTER TABLE `customer_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_tab`
--

DROP TABLE IF EXISTS `log_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_tab` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int DEFAULT NULL,
  `send_id` int NOT NULL,
  `action_text` varchar(4000) NOT NULL,
  `log_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `fk_log_adm` (`admin_id`),
  KEY `fk_log_send` (`send_id`),
  CONSTRAINT `fk_log_adm` FOREIGN KEY (`admin_id`) REFERENCES `admin_tab` (`admin_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_log_send` FOREIGN KEY (`send_id`) REFERENCES `sends_tab` (`send_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_tab`
--

LOCK TABLES `log_tab` WRITE;
/*!40000 ALTER TABLE `log_tab` DISABLE KEYS */;
INSERT INTO `log_tab` VALUES (1,1,1,'Opened investigation for damaged iPhone box.','2026-05-05 16:47:09'),(2,1,2,'Contacted store about wrong handbag color.','2026-05-05 16:47:09');
/*!40000 ALTER TABLE `log_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_detail_tab`
--

DROP TABLE IF EXISTS `order_detail_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_detail_tab` (
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`order_id`,`product_id`),
  KEY `fk_det_prod` (`product_id`),
  CONSTRAINT `fk_det_ord` FOREIGN KEY (`order_id`) REFERENCES `order_tab` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_det_prod` FOREIGN KEY (`product_id`) REFERENCES `product_tab` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_detail_tab`
--

LOCK TABLES `order_detail_tab` WRITE;
/*!40000 ALTER TABLE `order_detail_tab` DISABLE KEYS */;
INSERT INTO `order_detail_tab` VALUES (1001,201,1);
/*!40000 ALTER TABLE `order_detail_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_tab`
--

DROP TABLE IF EXISTS `order_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_tab` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `c_username` varchar(50) NOT NULL,
  `store_id` int NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `order_date` date NOT NULL,
  PRIMARY KEY (`order_id`),
  KEY `fk_ord_cust` (`c_username`),
  KEY `fk_ord_store` (`store_id`),
  CONSTRAINT `fk_ord_cust` FOREIGN KEY (`c_username`) REFERENCES `customer_tab` (`c_username`) ON DELETE CASCADE,
  CONSTRAINT `fk_ord_store` FOREIGN KEY (`store_id`) REFERENCES `store_tab` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1005 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_tab`
--

LOCK TABLES `order_tab` WRITE;
/*!40000 ALTER TABLE `order_tab` DISABLE KEYS */;
INSERT INTO `order_tab` VALUES (1001,'layla_mohammed',2,'Delivered','2024-02-11'),(1002,'amira_khalid',3,'Shipped','2024-02-15'),(1003,'nadia_ibrahim',1,'Pending','2024-02-20'),(1004,'layla_mohammed',1,'Delivered','2024-02-25');
/*!40000 ALTER TABLE `order_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owner_tab`
--

DROP TABLE IF EXISTS `owner_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owner_tab` (
  `owner_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `passwordd` varchar(50) NOT NULL,
  PRIMARY KEY (`owner_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner_tab`
--

LOCK TABLES `owner_tab` WRITE;
/*!40000 ALTER TABLE `owner_tab` DISABLE KEYS */;
INSERT INTO `owner_tab` VALUES (1,'sarah_ahmed','Sarah@123'),(2,'fatima_ali','Fatima@456'),(3,'nora_hassan','Nora@789');
/*!40000 ALTER TABLE `owner_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_tab`
--

DROP TABLE IF EXISTS `product_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_tab` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `namee` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `descriptionn` varchar(4000) DEFAULT NULL,
  `available_units` int NOT NULL DEFAULT '0',
  `image_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `fk_prod_store` (`store_id`),
  CONSTRAINT `fk_prod_store` FOREIGN KEY (`store_id`) REFERENCES `store_tab` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=303 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_tab`
--

LOCK TABLES `product_tab` WRITE;
/*!40000 ALTER TABLE `product_tab` DISABLE KEYS */;
INSERT INTO `product_tab` VALUES (1,1,'Chocolate Croissant',3.75,'Buttery croissant with chocolate filling.',40,'images/croissant.png'),(2,2,'iPhone 15',999.99,'Latest Apple smartphone.',30,'images/iphone15.png'),(3,2,'MacBook Pro',1299.99,'Powerful laptop for professionals.',15,'images/macbook.png'),(4,3,'Designer Handbag',249.99,'Elegant leather handbag.',20,'images/handbag.png'),(201,2,'iPhone 15',999.99,'Latest Apple smartphone.',30,'images/iphone15.png'),(301,3,'Designer Handbag',249.99,'Elegant leather handbag.',20,'images/handbag.png'),(302,3,'Silk Scarf',49.99,'Luxury silk scarf.',35,'images/scarf.png');
/*!40000 ALTER TABLE `product_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profile_tab`
--

DROP TABLE IF EXISTS `profile_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profile_tab` (
  `c_username` varchar(50) NOT NULL,
  `bio` varchar(4000) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`c_username`),
  CONSTRAINT `fk_profile_cust` FOREIGN KEY (`c_username`) REFERENCES `customer_tab` (`c_username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profile_tab`
--

LOCK TABLES `profile_tab` WRITE;
/*!40000 ALTER TABLE `profile_tab` DISABLE KEYS */;
INSERT INTO `profile_tab` VALUES ('amira_khalid','Fashion and beauty blogger','971501234567'),('layla_mohammed','Tech enthusiast and food lover','966501234567'),('nadia_ibrahim','Book lover and coffee addict','201234567890');
/*!40000 ALTER TABLE `profile_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_tab`
--

DROP TABLE IF EXISTS `report_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_tab` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `c_username` varchar(50) NOT NULL,
  `store_id` int NOT NULL,
  `issue_des` varchar(4000) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'open',
  `report_date` date NOT NULL,
  PRIMARY KEY (`report_id`),
  KEY `fk_rep_cust` (`c_username`),
  KEY `fk_rep_store` (`store_id`),
  CONSTRAINT `fk_rep_cust` FOREIGN KEY (`c_username`) REFERENCES `customer_tab` (`c_username`) ON DELETE CASCADE,
  CONSTRAINT `fk_rep_store` FOREIGN KEY (`store_id`) REFERENCES `store_tab` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_tab`
--

LOCK TABLES `report_tab` WRITE;
/*!40000 ALTER TABLE `report_tab` DISABLE KEYS */;
INSERT INTO `report_tab` VALUES (1,'layla_mohammed',2,'Phone arrived with damaged box.','open','2024-02-22'),(2,'amira_khalid',3,'Wrong color handbag received.','in-progress','2024-02-25');
/*!40000 ALTER TABLE `report_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_tab`
--

DROP TABLE IF EXISTS `review_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_tab` (
  `product_id` int NOT NULL,
  `review_number` int NOT NULL,
  `c_username` varchar(50) DEFAULT NULL,
  `comment_text` varchar(4000) DEFAULT NULL,
  `review_date` date NOT NULL,
  `rate` int DEFAULT NULL,
  PRIMARY KEY (`product_id`,`review_number`),
  KEY `fk_rev_cust` (`c_username`),
  CONSTRAINT `fk_rev_cust` FOREIGN KEY (`c_username`) REFERENCES `customer_tab` (`c_username`) ON DELETE CASCADE,
  CONSTRAINT `fk_rev_prod` FOREIGN KEY (`product_id`) REFERENCES `product_tab` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `review_tab_chk_1` CHECK ((`rate` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_tab`
--

LOCK TABLES `review_tab` WRITE;
/*!40000 ALTER TABLE `review_tab` DISABLE KEYS */;
INSERT INTO `review_tab` VALUES (201,1,'layla_mohammed','Absolutely love my new iPhone!','2024-02-12',5),(301,1,'amira_khalid','Beautiful handbag, great quality!','2024-02-18',5);
/*!40000 ALTER TABLE `review_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sends_tab`
--

DROP TABLE IF EXISTS `sends_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sends_tab` (
  `send_id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `report_id` int NOT NULL,
  `session_id` int NOT NULL,
  PRIMARY KEY (`send_id`),
  KEY `fk_send_store` (`store_id`),
  KEY `fk_send_rep` (`report_id`),
  KEY `fk_send_sess` (`session_id`),
  CONSTRAINT `fk_send_rep` FOREIGN KEY (`report_id`) REFERENCES `report_tab` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_send_sess` FOREIGN KEY (`session_id`) REFERENCES `session_tab` (`session_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_send_store` FOREIGN KEY (`store_id`) REFERENCES `store_tab` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sends_tab`
--

LOCK TABLES `sends_tab` WRITE;
/*!40000 ALTER TABLE `sends_tab` DISABLE KEYS */;
INSERT INTO `sends_tab` VALUES (1,2,1,1),(2,3,2,2);
/*!40000 ALTER TABLE `sends_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_tab`
--

DROP TABLE IF EXISTS `session_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_tab` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `user_type` varchar(20) NOT NULL,
  `customer_username` varchar(50) DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `login_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `logout_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `fk_sess_cust` (`customer_username`),
  KEY `fk_sess_own` (`owner_id`),
  KEY `fk_sess_adm` (`admin_id`),
  CONSTRAINT `fk_sess_adm` FOREIGN KEY (`admin_id`) REFERENCES `admin_tab` (`admin_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sess_cust` FOREIGN KEY (`customer_username`) REFERENCES `customer_tab` (`c_username`) ON DELETE CASCADE,
  CONSTRAINT `fk_sess_own` FOREIGN KEY (`owner_id`) REFERENCES `owner_tab` (`owner_id`) ON DELETE CASCADE,
  CONSTRAINT `session_tab_chk_1` CHECK ((`user_type` in (_utf8mb4'customer',_utf8mb4'owner',_utf8mb4'admin')))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_tab`
--

LOCK TABLES `session_tab` WRITE;
/*!40000 ALTER TABLE `session_tab` DISABLE KEYS */;
INSERT INTO `session_tab` VALUES (1,'customer','layla_mohammed',NULL,NULL,'2024-02-11 06:00:00',NULL),(2,'customer','amira_khalid',NULL,NULL,'2024-02-15 11:30:00',NULL),(3,'owner',NULL,1,NULL,'2024-02-20 07:00:00',NULL),(4,'owner',NULL,2,NULL,'2024-02-22 08:00:00',NULL),(5,'admin',NULL,NULL,1,'2024-02-23 10:00:00',NULL);
/*!40000 ALTER TABLE `session_tab` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_tab`
--

DROP TABLE IF EXISTS `store_tab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_tab` (
  `store_id` int NOT NULL AUTO_INCREMENT,
  `namee` varchar(100) NOT NULL,
  `owner_id` int NOT NULL,
  PRIMARY KEY (`store_id`),
  KEY `fk_store_owner` (`owner_id`),
  CONSTRAINT `fk_store_owner` FOREIGN KEY (`owner_id`) REFERENCES `owner_tab` (`owner_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_tab`
--

LOCK TABLES `store_tab` WRITE;
/*!40000 ALTER TABLE `store_tab` DISABLE KEYS */;
INSERT INTO `store_tab` VALUES (1,'Sarah Bakery',1),(2,'Tech by Fatima',2),(3,'Nora Fashion',3);
/*!40000 ALTER TABLE `store_tab` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-06 13:36:16
