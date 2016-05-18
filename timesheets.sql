-- MySQL dump 10.13  Distrib 5.5.49, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: timesheets
-- ------------------------------------------------------
-- Server version	5.5.49-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `companyname` char(50) DEFAULT NULL,
  `login` char(50) DEFAULT NULL,
  `password` char(40) DEFAULT NULL,
  `maker_key` char(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Network Communications','networkcommunications','tanteOlga112',NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_notifications`
--

DROP TABLE IF EXISTS `email_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_notifications` (
  `customer_id` int(10) NOT NULL,
  `emails` char(255) DEFAULT NULL,
  `events` char(255) DEFAULT NULL,
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `email_notifications_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_notifications`
--

LOCK TABLES `email_notifications` WRITE;
/*!40000 ALTER TABLE `email_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `events` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `event_name` char(40) DEFAULT NULL,
  `event_description` char(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'timesheet_work_started','Work started'),(2,'timesheet_work_ended','Work ended');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `customer_id` int(10) NOT NULL,
  `event_type` char(40) DEFAULT NULL,
  `emails` char(255) DEFAULT NULL,
  `email_template_subject` char(255) DEFAULT NULL,
  `email_template_body` text,
  `maker_key` char(50) DEFAULT NULL,
  `treshold` int(10) NOT NULL,
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications_last_sent`
--

DROP TABLE IF EXISTS `notifications_last_sent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications_last_sent` (
  `timesheet_id` int(10) NOT NULL,
  `notification_type` char(40) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `timesheet_id` (`timesheet_id`),
  CONSTRAINT `notifications_last_sent_ibfk_1` FOREIGN KEY (`timesheet_id`) REFERENCES `timesheets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications_last_sent`
--

LOCK TABLES `notifications_last_sent` WRITE;
/*!40000 ALTER TABLE `notifications_last_sent` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications_last_sent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timesheet_event_scheduler`
--

DROP TABLE IF EXISTS `timesheet_event_scheduler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timesheet_event_scheduler` (
  `timesheet_id` int(10) NOT NULL,
  `event_type` char(40) DEFAULT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `timesheet_id` (`timesheet_id`),
  CONSTRAINT `timesheet_event_scheduler_ibfk_1` FOREIGN KEY (`timesheet_id`) REFERENCES `timesheets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timesheet_event_scheduler`
--

LOCK TABLES `timesheet_event_scheduler` WRITE;
/*!40000 ALTER TABLE `timesheet_event_scheduler` DISABLE KEYS */;
INSERT INTO `timesheet_event_scheduler` VALUES (1,'timesheet_work_started','2016-05-11 07:16:57'),(1,'timesheet_work_stopped','2016-05-11 07:30:11');
/*!40000 ALTER TABLE `timesheet_event_scheduler` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timesheet_revisions`
--

DROP TABLE IF EXISTS `timesheet_revisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timesheet_revisions` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `timesheet_id` int(10) NOT NULL,
  `data` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `timesheet_id` (`timesheet_id`),
  CONSTRAINT `timesheet_revisions_ibfk_1` FOREIGN KEY (`timesheet_id`) REFERENCES `timesheets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timesheet_revisions`
--

LOCK TABLES `timesheet_revisions` WRITE;
/*!40000 ALTER TABLE `timesheet_revisions` DISABLE KEYS */;
/*!40000 ALTER TABLE `timesheet_revisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timesheets`
--

DROP TABLE IF EXISTS `timesheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timesheets` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `customer_id` int(10) NOT NULL,
  `title` char(40) DEFAULT NULL,
  `data` text,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  `billed` tinyint(1) NOT NULL DEFAULT '0',
  `fixed_price` tinyint(1) NOT NULL DEFAULT '0',
  `currently_working` tinyint(1) NOT NULL DEFAULT '0',
  `description` text,
  `total` decimal(7,2) DEFAULT NULL,
  `last_starttime` char(10) DEFAULT NULL,
  `last_endtime` char(10) DEFAULT NULL,
  `last_task` char(90) DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `timesheets_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timesheets`
--

LOCK TABLES `timesheets` WRITE;
/*!40000 ALTER TABLE `timesheets` DISABLE KEYS */;
INSERT INTO `timesheets` VALUES (1,1,'Moodle rettelser','[{\"date\":\"2016-05-10\",\"starttime\":\"09:50\",\"endtime\":\"09:57\",\"task\":\"Fejl ved oprettelse af bruger\"},{\"starttime\":\"10:11\",\"endtime\":\"11:10\",\"task\":\"Fejl ved oprettelse af bruger\"},{\"starttime\":\"11:49\",\"endtime\":\"11:55\",\"task\":\"Nyt domÃ¦nenavn\"},{\"starttime\":\"11:55\",\"endtime\":\"12:20\",\"task\":\"Fejl ved oprettelse af bruger\",\"note\":\"OpsÃ¦tning af udviklingsserver\"},{\"starttime\":\"12:27\",\"endtime\":\"13:09\",\"task\":\"Fejl ved oprettelse af bruger\",\"note\":\"OpsÃ¦tning af udviklingsserver\"},{\"starttime\":\"13:31\",\"endtime\":\"13:55\",\"task\":\"Upload af store videoer\"},{\"starttime\":\"14:05\",\"endtime\":\"14:22\",\"task\":\"Nyt domÃ¦nenavn\"},{\"starttime\":\"14:27\",\"endtime\":\"14:28\"},{\"starttime\":\"15:06\",\"endtime\":\"15:14\"},{\"date\":\"2016-05-11\",\"starttime\":\"09:00\",\"endtime\":\"09:30\"},{\"starttime\":\"09:30\",\"endtime\":\"09:36\"}]',1,0,0,0,'Rettelser pÃ¥ elsassfondens moodle-lÃ¸sning. Almindelig timetakst (600 kr/t ekskl. moms)',3.75,'09:30','09:36','','2016-05-11 08:55:31');
/*!40000 ALTER TABLE `timesheets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-05-11 21:54:45
