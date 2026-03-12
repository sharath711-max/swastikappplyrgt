-- Migration: Customers (Deduplicated)
PRAGMA foreign_keys = OFF;

INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bf3b9e12898d03b7ea', 'ibrahim malik', '7676740497', 0, '', '2022-07-04 10:35:31.839243', '2022-07-04 10:35:31.839243', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7c6ba81273ba11086e', 'bolanth das', '7204878909', 0, '', '2022-07-04 11:04:05.664277', '2022-07-04 11:04:05.664277', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8fd60116822cfb5871', 'ranjan mandal', '9064388932', 0, 'seth 9945804377', '2022-07-04 11:05:26.565197', '2022-07-04 11:05:26.565197', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1088d563c85afa5ddb', 'chotu das', '9980926737', 0, '', '2022-07-04 11:19:29.093752', '2022-07-04 11:19:29.093752', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8f090cf537fbde9d8d', 'manoj', NULL, 0, '', '2022-07-04 11:41:04.595557', '2022-07-04 11:41:04.595557', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('73a5bfb75df2464765', 'pintu maji', '9739663107', 0, '', '2022-07-04 11:49:21.573854', '2022-07-04 11:49:21.573854', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cc15004ac80abc29ef', 'sujeet das', '8072810913', 0, '', '2022-07-04 11:52:20.158507', '2022-07-04 11:52:20.158507', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('40e8ca193b58ddc360', 'ashok soni', '9875490124', 0, '', '2022-07-04 11:56:27.184743', '2022-07-04 11:56:27.184743', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d7e947e295462d65b8', 'ali da', NULL, 30, '', '2022-07-04 12:01:50.901107', '2022-07-04 12:01:50.901107', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7928c652a1afaf75a9', 'maidul khan', '7406433794', 0, '', '2022-07-04 12:17:13.812150', '2022-07-04 12:17:13.812150', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e441684eca136d4cd0', 'javed', NULL, 60, '', '2022-07-04 12:26:51.101776', '2022-07-04 12:26:51.101776', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('43891ad2f639001370', 'manoj hambi', '6363688279', 0, '', '2022-07-04 12:51:42.170126', '2022-07-04 12:51:42.170126', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1da6b8cc4e776b3778', 'rafique mallo', NULL, 0, '', '2022-07-04 12:53:41.849358', '2022-07-04 12:53:41.849358', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('022fd2b3ce1b939fe8', 'uttham sawanth', NULL, 0, '', '2022-07-04 12:54:09.882363', '2022-07-04 12:54:09.882363', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7a08374f90b79f3c67', 'tamal das', '7483166700', 0, '', '2022-07-04 12:57:32.461987', '2022-07-04 12:57:32.461987', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ed00439d9d6259cd22', 'akash gujay', '8431832814', 0, '', '2022-07-04 13:05:33.667535', '2022-07-04 13:05:33.667535', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2f80a9ab73bbd6a50a', 'chandan manna', '8670531051', 0, '', '2022-07-04 13:08:19.001275', '2022-07-04 13:08:19.001275', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('058438d3e3bea0920c', 'nirmal maithye', '7676919672', 0, '', '2022-07-04 13:10:30.207241', '2022-07-04 13:10:30.207241', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('72d2bd68d3aaf058f9', 'babu', NULL, 30, '', '2022-07-04 13:12:12.367110', '2022-07-04 13:12:12.367110', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c8c8d62231f2afb081', 'pradeep gorang', '9886128898', 0, '', '2022-07-04 13:27:48.877764', '2022-07-04 13:27:48.877764', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('82df32a1824da12955', 'sameer das', '9742671531', 0, 'TARUN', '2022-07-04 13:37:08.285609', '2022-07-04 13:37:08.285609', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('33ed43eb8db6c8b210', 'luky', NULL, 0, '', '2022-07-04 13:44:59.324196', '2022-07-04 13:44:59.324196', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b2055a3e89bca0b8d4', 'mahima j', NULL, 0, '', '2022-07-04 14:24:18.701189', '2022-07-04 14:24:18.701189', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('faa6a521291ceb8587', 'Iqbal', NULL, 30, '', '2022-07-04 14:28:42.227282', '2022-07-04 14:28:42.227282', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4912411fd2a4fa4efb', 'qurban ali', NULL, 0, '', '2022-07-04 14:30:48.331523', '2022-07-04 14:30:48.331523', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('887f417f42d19b574c', 'santu', NULL, 0, '', '2022-07-04 14:33:12.529208', '2022-07-04 14:33:12.529208', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f4de6d9eab3aacf6f0', 'habib s k', NULL, 30, '', '2022-07-04 14:37:10.813003', '2022-07-04 14:37:10.813003', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b7476cf4721478b1ce', 's k shabiuddin', NULL, 0, '', '2022-07-04 14:51:04.655366', '2022-07-04 14:51:04.655366', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6f83c0c54415dd1561', 'gunodhar sawantho', NULL, 30, '', '2022-07-04 15:07:18.508587', '2022-07-04 15:07:18.508587', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4aa49793e435925d5e', 'deva', NULL, 0, '', '2022-07-04 15:11:22.874783', '2022-07-04 15:11:22.874783', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('140d695ceeb36f48fc', 'sharvan', NULL, 0, '', '2022-07-04 15:12:42.331521', '2022-07-04 15:12:42.331521', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d3cf5fced86dd75b56', 'nithai das', '8123484947', 0, '', '2022-07-04 15:19:08.694987', '2022-07-04 15:19:08.694987', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('51987007c04e4d989c', 'sujeet maithi', NULL, 0, '', '2022-07-04 16:09:53.529006', '2022-07-04 16:09:53.529006', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('797df5e855a9acd28a', 'ashok', NULL, 30, '', '2022-07-04 16:16:36.511136', '2022-07-04 16:16:36.511136', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bb6378ab13e82175d2', 'lucky', NULL, 0, '', '2022-07-04 16:20:53.261504', '2022-07-04 16:20:53.261504', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fe5b6ca493cbacb146', 's k habib', '9353393586', 0, '', '2022-07-04 16:49:42.457436', '2022-07-04 16:49:42.457436', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('42054607b04e0a5568', 'nandu bera', '9880009144', 0, '', '2022-07-04 16:53:50.942259', '2022-07-04 16:53:50.942259', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b9f79cdd5d9137c02a', 'nadeem', '7019584991', 0, '', '2022-07-04 17:16:24.050074', '2022-07-04 17:16:24.050074', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9068f867593cebaea1', 'raju', NULL, 0, '', '2022-07-04 17:35:52.674279', '2022-07-04 17:35:52.674279', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('44e31e24ab98b33dac', 'polash', NULL, 0, '', '2022-07-04 17:37:23.555020', '2022-07-04 17:37:23.555020', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('07ad6bc2e44e2832de', 'santu majondar', NULL, 0, '', '2022-07-04 18:22:31.572837', '2022-07-04 18:22:31.572837', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('efdcc35334dca9f2b3', 'salim', NULL, 60, '', '2022-07-04 18:23:07.067540', '2022-07-04 18:23:07.067540', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('342f503688f1e2d51e', 'sujai', NULL, 60, '', '2022-07-04 18:23:39.619241', '2022-07-04 18:23:39.619241', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b0b98e1d81b7936363', 'sameer sawantho', NULL, 90, '', '2022-07-04 18:24:36.808626', '2022-07-04 18:24:36.808626', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b527e7709bf83f8e40', 'sanjeev bera', NULL, 0, '', '2022-07-04 18:42:56.320503', '2022-07-04 18:42:56.320503', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dc675c574415101f8b', 'karhik sawantho', NULL, 0, '', '2022-07-04 18:44:21.992218', '2022-07-04 18:44:21.992218', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b6ed5a004ede2c9240', 'samar', NULL, 30, '', '2022-07-04 18:55:59.324289', '2022-07-04 18:55:59.324289', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2eb772e27fa6ad28da', 'siddu', NULL, 0, '', '2022-07-04 19:07:54.933471', '2022-07-04 19:07:54.933471', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4ffcfebeefbda2c57b', 'rafique moula', NULL, 0, '', '2022-07-04 19:18:29.090747', '2022-07-04 19:18:29.090747', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1dab300f4497ef48d3', 'anand', NULL, 30, '', '2022-07-04 19:19:58.786004', '2022-07-04 19:19:58.786004', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('45e570e150890c1491', 'sham  mana', '7433810236', 0, '', '2022-07-04 19:57:11.894909', '2022-07-04 19:57:11.894909', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1dd390c67c3ceea154', 'polash samanthu', '7483738956', 0, '', '2022-07-04 20:32:06.392554', '2022-07-04 20:32:06.392554', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0acffdfe163cd693d5', 'anup panja', '8240792934', 0, '8346881614', '2022-07-04 20:39:26.055714', '2022-07-04 20:39:26.055714', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e89534e3c73a1e3893', 'subhojeet manna', '8296697390', 0, '', '2022-07-04 20:48:22.571141', '2022-07-04 20:48:22.571141', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e4d67419dc682fc810', 'debashish sasmal', '9108472218', 0, '', '2022-07-04 21:00:40.100224', '2022-07-04 21:00:40.100224', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1ed94bdac5b3f2f726', 'ranjith dhara', '9035733362', 0, '', '2022-07-05 10:34:26.052615', '2022-07-05 10:34:26.052615', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bb87d90418f073e999', 'amal', NULL, 0, '', '2022-07-05 11:32:17.482250', '2022-07-05 11:32:17.482250', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4ea1c10352e91faf09', 'sanjay', NULL, 60, '', '2022-07-05 11:43:58.619784', '2022-07-05 11:43:58.619784', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2ebe21169ca3f86632', 'ranjeet', NULL, 0, '', '2022-07-05 11:57:04.372951', '2022-07-05 11:57:04.372951', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9c03543864ab8b5fa6', 'raj', NULL, 0, '', '2022-07-05 12:00:49.899078', '2022-07-05 12:00:49.899078', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('abc7941b3b57c68818', 'sujeet roy', NULL, 0, '', '2022-07-05 12:35:52.668011', '2022-07-05 12:35:52.668011', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c018dfb948d99aa14', 'rajesh', NULL, 2800, '', '2022-07-05 12:47:49.941819', '2022-07-05 12:47:49.941819', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dd1558047b9d97bb58', 'mansoor', NULL, 0, '', '2022-07-05 12:49:50.572102', '2022-07-05 12:49:50.572102', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1bb00785fcf1bdd421', 'sanjeet', NULL, 30, '', '2022-07-05 12:50:16.790390', '2022-07-05 12:50:16.790390', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c5104162437ab19caf', 'satya', NULL, 30, '', '2022-07-05 12:51:07.445584', '2022-07-05 12:51:07.445584', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('79b54683970a13d2de', 'babulalji', NULL, 0, '', '2022-07-05 13:00:24.775268', '2022-07-05 13:00:24.775268', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f43bf1cd54011fecbb', 'chiranjeet', NULL, 30, '', '2022-07-05 13:05:45.695477', '2022-07-05 13:05:45.695477', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('96ecc6650f4c862626', 'bappa rajvanshi', NULL, 0, '', '2022-07-05 13:09:17.627817', '2022-07-05 13:09:17.627817', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7ad4622f974d80c54a', 'maschyar', NULL, 0, '', '2022-07-05 13:12:10.578413', '2022-07-05 13:12:10.578413', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('19894c614c7cb506e5', 'prashanth poriya', '9022832837', 0, '', '2022-07-05 13:13:58.988241', '2022-07-05 13:13:58.988241', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('561f6e23e638fe5242', 'karthik', NULL, 30, '', '2022-07-05 13:40:13.648721', '2022-07-05 13:40:13.648721', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('227eeca3856e440e9f', 'debu singh', '9353287503', 0, '', '2022-07-05 13:45:38.525963', '2022-07-05 13:45:38.525963', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('180a16b028e740c466', 'subhir das', '7019319733', 0, '', '2022-07-05 13:55:26.298685', '2022-07-05 13:55:26.298685', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2530cf8ff959619c09', 'tapas bakshi', '8105751230', 0, '', '2022-07-05 14:22:39.023735', '2022-07-05 14:22:39.023735', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('09e4ea3aa32f28b212', 'sandeep', NULL, 0, '', '2022-07-05 14:41:42.164199', '2022-07-05 14:41:42.164199', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c09175aa9ab20c4c62', 'navarathan jewels', NULL, 350, '', '2022-07-05 14:53:22.948505', '2022-07-05 14:53:22.948505', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('184be511b3c965fb68', 'jain jewel', NULL, 9390, '', '2022-07-05 14:57:43.132971', '2022-07-05 14:57:43.132971', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a110cb06711db06d0', 'hari prasad', NULL, 0, '', '2022-07-05 15:16:06.775281', '2022-07-05 15:16:06.775281', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('70b93ea7d6fc005b66', 'pranab', NULL, 0, '', '2022-07-05 15:20:15.859747', '2022-07-05 15:20:15.859747', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('95126f2f016f788f15', 'sathinath', NULL, 0, '', '2022-07-05 15:32:18.887067', '2022-07-05 15:32:18.887067', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e4fdfe07052f6c8e18', 'n g', NULL, 0, '', '2022-07-05 15:38:09.803943', '2022-07-05 15:38:09.803943', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4e4db508033a9ce592', 'laxman', NULL, 0, '', '2022-07-05 15:52:05.878537', '2022-07-05 15:52:05.878537', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('890378a9dd7ae2725d', 'ali bhai', NULL, 0, '', '2022-07-05 16:08:31.854556', '2022-07-05 16:08:31.854556', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c70d62f15d9caf1785', 'rohit', NULL, 0, '', '2022-07-05 16:10:53.058499', '2022-07-05 16:10:53.058499', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aaa0f94867233d5dd4', 'chandu karmokar', '9972103976', 0, '', '2022-07-05 16:18:43.344474', '2022-07-05 16:18:43.344474', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('92c676d12bed44377d', 'kishna', NULL, 0, '', '2022-07-05 16:21:37.743424', '2022-07-05 16:21:37.743424', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eaaaec7882eed13d74', 'biswajeet', NULL, 0, '', '2022-07-05 16:32:08.265512', '2022-07-05 16:32:08.265512', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('24c3a7961a3b8c9f03', 'sushanth giri', '8310491785', 0, '', '2022-07-05 16:44:09.632068', '2022-07-05 16:44:09.632068', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('13204ba40b3edd2c09', 'rakhal', NULL, 0, '', '2022-07-05 16:46:55.183032', '2022-07-05 16:46:55.183032', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('21ed73f7cdd213594b', 'bijay sawanth', NULL, 0, '', '2022-07-05 16:52:00.290379', '2022-07-05 16:52:00.290379', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d4d40d9edd5e10f12b', 's p d', NULL, 100, '', '2022-07-05 17:11:10.591010', '2022-07-05 17:11:10.591010', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a05d63d303a63c7ef7', 'ali', NULL, 30, '', '2022-07-05 17:13:35.552677', '2022-07-05 17:13:35.552677', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9ab5915689ee66aa95', 'abhijeet bang', NULL, 0, '', '2022-07-05 17:16:51.620285', '2022-07-05 17:16:51.620285', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c8728cb90d03fc23e5', 'anup sawanth', NULL, 0, '', '2022-07-05 17:46:24.663563', '2022-07-05 17:46:24.663563', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9eca977aeb36b4b9b8', 'bh maji', '8867157366', 0, '', '2022-07-05 17:49:33.782480', '2022-07-05 17:49:33.782480', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('069777678d41570808', 'shymal maithi', '9845498374', 0, '', '2022-07-05 18:06:55.797172', '2022-07-05 18:06:55.797172', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('841f9b1973a2985793', 'harinath', NULL, 0, '', '2022-07-05 18:08:32.099757', '2022-07-05 18:08:32.099757', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e9c4e690e7b84f5cfc', 'dinu patra', '9916349225', 0, '', '2022-07-05 18:09:49.444719', '2022-07-05 18:09:49.444719', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4e7a7eb8640749af36', 'robin maji', '8951086377', 30, '', '2022-07-05 18:19:59.510703', '2022-07-05 18:19:59.510703', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e3cd3a24fbde694881', 'surjeet maithi', '8088744185', 0, '', '2022-07-05 18:32:14.018714', '2022-07-05 18:32:14.018714', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fc7cf4217f3835a345', 'raju samantho', '7406171223', 30, '', '2022-07-05 19:04:15.060255', '2022-07-05 19:04:15.060255', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d968524b44db01349', 'rakhal maji', '8095471791', 30, '', '2022-07-05 19:12:27.514103', '2022-07-05 19:12:27.514103', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1cd18e8b82a3a0d744', 'ashok .j', NULL, 0, '', '2022-07-05 19:13:08.783157', '2022-07-05 19:13:08.783157', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4923b2098d84fbaa88', 'pradeep patra', '9886122138', 30, '', '2022-07-05 19:25:29.807854', '2022-07-05 19:25:29.807854', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('28148ea526ef68f2ea', 'bisho biswas', NULL, 0, '', '2022-07-05 19:28:10.163208', '2022-07-05 19:28:10.163208', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1af786b8454c6999a0', 'shakthi bera', '7619455957', 0, '', '2022-07-05 19:36:42.480773', '2022-07-05 19:36:42.480773', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8a5e569d061161dcf2', 'surya das', '7477648487', 0, '', '2022-07-05 19:52:15.472370', '2022-07-05 19:52:15.472370', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('479aa0b54161606f2e', 'subhir jana', '9008265974', 0, '', '2022-07-05 20:19:28.427139', '2022-07-05 20:19:28.427139', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2a6553b7715468dd2e', 'ram bera', NULL, 0, '', '2022-07-05 20:30:11.373755', '2022-07-05 20:30:11.373755', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('05634be9c67e6c1f82', 'sisir goldar', '9123371778', 0, '', '2022-07-05 20:39:07.625874', '2022-07-05 20:39:07.625874', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('008fed7a145ae4dfdb', 'shanatanu sasmal', '6362597991', 0, '', '2022-07-05 20:42:03.287171', '2022-07-05 20:42:03.287171', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('34da1b44d516a426d1', 'amal sadra', '9108001806', 0, '', '2022-07-05 20:45:17.964311', '2022-07-05 20:45:17.964311', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ede38ff99bc14848a4', 'goutham kole', '9019640363', 0, '', '2022-07-05 20:53:42.497760', '2022-07-05 20:53:42.497760', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3c8e502c46aa8437b4', 'm b j', NULL, 0, '', '2022-07-05 21:15:38.212608', '2022-07-05 21:15:38.212608', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c6ed44d563cd97af0f', 'pradeep bhag', NULL, 0, '', '2022-07-05 21:17:39.780755', '2022-07-05 21:17:39.780755', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e9bf1bdc257547b53f', 'nibhas sawantho', '9353041938', 30, '', '2022-07-06 11:06:04.762915', '2022-07-06 11:06:04.762915', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4bb573e375ddf3d89c', 'bulbul', NULL, 0, '', '2022-07-06 11:21:24.654313', '2022-07-06 11:21:24.654313', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b436fd0307ecbb7e71', 'shymal', NULL, 0, '', '2022-07-06 11:38:05.943352', '2022-07-06 11:38:05.943352', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('795165381bb7858cbf', 'tanmai', NULL, 0, '', '2022-07-06 11:48:52.607831', '2022-07-06 11:48:52.607831', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5f4bcadff9b47c6179', 'kamal', NULL, 0, '', '2022-07-06 11:49:25.953356', '2022-07-06 11:49:25.953356', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6afb032770aa36ae26', 'milan das', NULL, 0, '', '2022-07-06 11:55:30.207525', '2022-07-06 11:55:30.207525', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('72fa81a079843ae05a', 'jasim', NULL, 0, '', '2022-07-06 12:06:34.897288', '2022-07-06 12:06:34.897288', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('192cc802a6fffdde52', 'balaram', NULL, 0, '', '2022-07-06 12:15:55.651947', '2022-07-06 12:15:55.651947', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ba01d25bd2bf31c3d4', 'minsarul', NULL, 0, '', '2022-07-06 12:23:45.310586', '2022-07-06 12:23:45.310586', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('124f185cfa6e398ffa', 'lalu da', NULL, 0, '', '2022-07-06 12:37:48.308061', '2022-07-06 12:37:48.308061', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('594627c73b71f27e6c', 'bama patra', NULL, 30, '', '2022-07-06 12:43:17.843731', '2022-07-06 12:43:17.843731', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4dd90f00825161baf7', ';hiralal', NULL, 0, '', '2022-07-06 12:45:09.157374', '2022-07-06 12:45:09.157374', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('def2bd7c817cca2949', 'siddhu', NULL, 30, '', '2022-07-06 13:21:59.096671', '2022-07-06 13:21:59.096671', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c0a1936eca89fc26fd', 'jullu', NULL, 0, '', '2022-07-06 13:24:09.290196', '2022-07-06 13:24:09.290196', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bc2afe83a6bd753a80', 'kallipadu bomik', NULL, 0, '', '2022-07-06 13:25:24.655054', '2022-07-06 13:25:24.655054', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2ad6f41ae89db6a82f', 'bharath manna', NULL, 30, '', '2022-07-06 13:36:12.051843', '2022-07-06 13:36:12.051843', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4be0a0077a53eee027', 'jayanth maithi', NULL, 0, '', '2022-07-06 13:40:55.071731', '2022-07-06 13:40:55.071731', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a05ccb699fc18216d8', 'gourang karmakar', NULL, 0, '', '2022-07-06 13:55:56.903778', '2022-07-06 13:55:56.903778', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2d01c0fde49b9b230a', 'nakul mondal', NULL, 0, '', '2022-07-06 14:02:15.022868', '2022-07-06 14:02:15.022868', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9f1ca512194eb258cc', 'manju', NULL, 0, '', '2022-07-06 15:07:41.533623', '2022-07-06 15:07:41.533623', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b12b6b952eb7af37f4', 'ashish', NULL, 0, '', '2022-07-06 15:08:04.469294', '2022-07-06 15:08:04.469294', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e10c1fa0aab9a98a33', 'chandi das', '8147260035', 0, '', '2022-07-06 15:15:29.216686', '2022-07-06 15:15:29.216686', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('930f9d56da0a725fdc', 'mukund pramanik', NULL, 0, '', '2022-07-06 15:29:32.200495', '2022-07-06 15:29:32.200495', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bb11ed9e1182cc6e69', 'sumantho kabi', NULL, 0, '', '2022-07-06 15:55:44.277647', '2022-07-06 15:55:44.277647', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('410523134a775d229a', 's s', NULL, 0, '', '2022-07-06 16:21:43.112698', '2022-07-06 16:21:43.112698', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('53e8b8857aaadc6c41', 'somnath', NULL, 0, '', '2022-07-06 16:50:22.840480', '2022-07-06 16:50:22.840480', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ecacf9697be38ab090', 'wasim', NULL, 0, '', '2022-07-06 17:14:26.972056', '2022-07-06 17:14:26.972056', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f31ca8dc50f2c3a4cb', 'mohit das', NULL, 0, '', '2022-07-06 17:21:49.666743', '2022-07-06 17:21:49.666743', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c66fa8ceebe3079e52', 'gunodhar', NULL, 0, '', '2022-07-06 17:22:28.471034', '2022-07-06 17:22:28.471034', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d8263c021f8ce8ffb', 'shoaib pasha', NULL, 0, '', '2022-07-06 17:57:45.633218', '2022-07-06 17:57:45.633218', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b8b77f855ec5684e5a', 'm.j', NULL, 0, '', '2022-07-06 18:00:02.790688', '2022-07-06 18:00:02.790688', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2a2e035ad5685e11d1', 'raj silver', NULL, 0, '', '2022-07-06 18:05:14.761115', '2022-07-06 18:05:14.761115', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1b4a2ab58bfb68e6f5', 'srimantu', NULL, 0, '', '2022-07-06 18:20:23.745707', '2022-07-06 18:20:23.745707', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cc483f0425242aea80', 'nithaye maji', '9742069913', 0, '', '2022-07-06 18:35:04.214486', '2022-07-06 18:35:04.214486', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('27e701b4fe72b78504', 'vikram choudry', NULL, 0, '', '2022-07-06 19:21:56.833182', '2022-07-06 19:21:56.833182', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cf15b3b63f0eeecd2e', 'bablu', NULL, 30, '', '2022-07-06 19:23:41.445298', '2022-07-06 19:23:41.445298', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('90f5eafa3456d7755b', 'jhankar', NULL, 30, '', '2022-07-06 19:25:31.532918', '2022-07-06 19:25:31.532918', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d78441a1b8cf37acb5', 'hiralal samaotho', '7004994228', 0, '', '2022-07-06 19:34:27.058184', '2022-07-06 19:34:27.058184', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2e58e7248f686e1302', 'ramesh das', '7676080868', 0, '', '2022-07-06 19:36:33.591027', '2022-07-06 19:36:33.591027', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('952834d0409b61c16a', 'moliye', NULL, 0, '', '2022-07-06 20:18:33.780183', '2022-07-06 20:18:33.780183', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0f5295fb93297006cf', 'yasin shek', '8617643478', 0, '', '2022-07-06 20:27:20.324721', '2022-07-06 20:27:20.324721', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7b89e89065bb6a81e8', 'karthik maithye', '7477583624', 0, '', '2022-07-06 20:39:34.782638', '2022-07-06 20:39:34.782638', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('be8708b123129c28bd', 'bablu hait', '8001916075', 0, '', '2022-07-07 10:14:38.724201', '2022-07-07 10:14:38.724201', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a6c1b0b8d729925070', 'heeralal', NULL, 0, '', '2022-07-07 11:31:31.797850', '2022-07-07 11:31:31.797850', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('83810fc8adf07234fb', 'naren dey', '7019098446', 0, '', '2022-07-07 11:54:26.084647', '2022-07-07 11:54:26.084647', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('33c5e5674dff7e794b', 'ranjith jana', '8016707461', 0, '', '2022-07-07 12:08:06.810601', '2022-07-07 12:08:06.810601', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('de04a0a23491f6be96', 'suresh  debar', '9698994227', 0, '', '2022-07-07 12:43:23.385481', '2022-07-07 12:43:23.385481', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9fa1d97f29ad7e1c52', 'animesh das', '8250628836', 0, '', '2022-07-07 12:46:09.464761', '2022-07-07 12:46:09.464761', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9994aea6137a87a124', 'bikas goldhar', '8431104008', 0, '', '2022-07-07 12:49:26.151036', '2022-07-07 12:49:26.151036', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('092fb6e23785e63071', 'bhaskar das', '9635456170', 0, '', '2022-07-07 12:50:28.999694', '2022-07-07 12:50:28.999694', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('90299a4bc41c0f71ff', 'mohasin sheikh', '9036795278', 0, '', '2022-07-07 12:56:33.332416', '2022-07-07 12:56:33.332416', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c3d12f04d71e7998f5', 'tapas mandal', '8310023899', 0, '', '2022-07-07 13:16:06.332265', '2022-07-07 13:16:06.332265', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fbb9f8de1d48db4568', 'kiran', NULL, 0, '', '2022-07-07 14:02:05.361719', '2022-07-07 14:02:05.361719', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9a58da8f274316e189', 'am sameer', NULL, 0, '', '2022-07-07 14:25:33.654358', '2022-07-07 14:25:33.654358', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('43f916acca89b25dd5', 'sandeep sasmal', '6360589741', 0, '', '2022-07-07 15:51:17.812284', '2022-07-07 15:51:17.812284', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d3aebdf9b88bbe7f84', 'shankar', NULL, 0, '', '2022-07-07 16:09:01.572202', '2022-07-07 16:09:01.572202', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fdfc72c499f6a067ac', 'pradeep jana', '8553910715', 0, '', '2022-07-07 16:55:43.188729', '2022-07-07 16:55:43.188729', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b5d6b0c889e5cd622b', 'anmol swarna', NULL, 0, '', '2022-07-07 17:24:19.678288', '2022-07-07 17:24:19.678288', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b7513fbb1e8aa90036', 'anup maji', '9902831083', 0, '', '2022-07-07 18:05:27.986985', '2022-07-07 18:05:27.986985', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('93141b9db1caae3c5e', 'basanth', NULL, 0, '', '2022-07-07 18:08:03.560128', '2022-07-07 18:08:03.560128', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6bac33f6e36d1b60e1', 'shek noor', NULL, 0, '', '2022-07-07 18:21:57.618930', '2022-07-07 18:21:57.618930', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('118b6936045b42cf48', 'bhaskar dhara', '9743232883', 0, '', '2022-07-07 18:48:42.965363', '2022-07-07 18:48:42.965363', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6e1bc657a1eb2a94f7', 'bikas', NULL, 0, '', '2022-07-07 19:04:09.365941', '2022-07-07 19:04:09.365941', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2d4318f068eb08d794', 'tarun paria', '9035641320', 0, '', '2022-07-07 19:09:46.897428', '2022-07-07 19:09:46.897428', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2af1ff8f6a80878893', 'mataji', NULL, 0, '', '2022-07-07 19:14:39.177661', '2022-07-07 19:14:39.177661', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ba8dfb9b611b1089ef', 'd k', NULL, 0, '', '2022-07-07 19:17:44.800148', '2022-07-07 19:17:44.800148', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6efca37707be6aee94', 'chandrakanth', NULL, 30, '', '2022-07-07 19:23:54.907027', '2022-07-07 19:23:54.907027', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9a21d3e6c800c7473b', 'srimanth hajra', NULL, 0, '', '2022-07-07 19:38:10.268636', '2022-07-07 19:38:10.268636', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('904c364e78126fd283', 'debashish', NULL, 0, '', '2022-07-07 19:45:01.584269', '2022-07-07 19:45:01.584269', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9e57ab30d7ffafb346', 'neelkanth', NULL, 30, '', '2022-07-07 19:49:10.184456', '2022-07-07 19:49:10.184456', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('579b6e59fe1c045db1', 'tushar pore', '9916628736', 0, '', '2022-07-07 19:51:36.956338', '2022-07-07 19:51:36.956338', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bd6f0403a116e9d72d', 'nakul mandal', '9845694910', 0, '', '2022-07-07 20:01:30.586223', '2022-07-07 20:01:30.586223', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bf05c88292763c01c9', 'somu', NULL, 0, '', '2022-07-07 20:10:57.220909', '2022-07-07 20:10:57.220909', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f84940c122171c9224', 'priyo maithi', '6362917543', 0, '', '2022-07-07 21:09:46.519354', '2022-07-07 21:09:46.519354', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1cc696dc2fec81a9da', 'yusuf', NULL, 0, '', '2022-07-08 11:01:33.727006', '2022-07-08 11:01:33.727006', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cba43acbe2ecff1c58', 'krishna', NULL, 0, '', '2022-07-08 11:04:07.005739', '2022-07-08 11:04:07.005739', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9ab0b5b0f3517734f6', 'pradeep kotal', '6380313674', 0, '', '2022-07-08 11:22:48.037573', '2022-07-08 11:22:48.037573', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b736c62ef61fa66347', 'pintu shek', '9113644197', 0, '', '2022-07-08 11:30:04.195381', '2022-07-08 11:30:04.195381', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('80d6ab076151579a6f', 'pacho', NULL, 0, '', '2022-07-08 11:43:07.908777', '2022-07-08 11:43:07.908777', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d3d6f29ebb480e8ac2', 'subho mandal', '7797549074', 0, '', '2022-07-08 11:59:14.413900', '2022-07-08 11:59:14.413900', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4b420b3ac6a910201a', 'sadham hocean', NULL, 0, '', '2022-07-08 12:27:46.862162', '2022-07-08 12:27:46.862162', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ee15179b7a6a146180', 'kamlesh maji', '7676627591', 0, '', '2022-07-08 13:22:40.377762', '2022-07-08 13:22:40.377762', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8f95f786b723fe1a0a', 'shakthi', NULL, 50, '', '2022-07-08 13:29:12.661622', '2022-07-08 13:29:12.661622', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6e143dfb27f0311e7d', 'lakshmi sadra', '9647515218', 0, '', '2022-07-08 13:32:20.724945', '2022-07-08 13:32:20.724945', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c85a637b62c5f60534', 'rajeev karmakar', '9886166417', 0, '', '2022-07-08 13:42:17.703123', '2022-07-08 13:42:17.703123', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ba50eeb486c53ffd87', 'ramesh barik', '9206873591', 0, '', '2022-07-08 14:16:06.487409', '2022-07-08 14:16:06.487409', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4be513ef36fd736efe', 'uttham sar', NULL, 0, '', '2022-07-08 14:24:22.419221', '2022-07-08 14:24:22.419221', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('36196498f2147de058', 'utpal biswas', '8637046470', 0, '', '2022-07-08 14:50:50.428747', '2022-07-08 14:50:50.428747', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fb6be50b95db5861ee', 'subhash da', '8799743598', 0, '', '2022-07-08 15:02:59.016001', '2022-07-08 15:02:59.016001', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('27c975a930e9d83b7f', 'shyam', NULL, 60, '', '2022-07-08 15:03:41.517398', '2022-07-08 15:03:41.517398', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('534e71e1ccbfab6f82', 'jain diamonds', NULL, 0, '', '2022-07-08 15:08:37.508863', '2022-07-08 15:08:37.508863', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('da52704ed317012d14', 'anup bomik', '9742547828', 0, '', '2022-07-08 15:50:31.705490', '2022-07-08 15:50:31.705490', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ed0d2123a181d14f5a', 'gokul', NULL, 0, '', '2022-07-08 16:11:55.635753', '2022-07-08 16:11:55.635753', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a4e198cb4faa36446b', 'rathan das', NULL, 0, '', '2022-07-08 16:20:05.568702', '2022-07-08 16:20:05.568702', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dc7c0f9e0a828edbd6', 'uttham', NULL, 30, '', '2022-07-08 16:26:57.447263', '2022-07-08 16:26:57.447263', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('da095e74342e116138', 'dilip sasmal', '8904803937', 0, '', '2022-07-08 16:47:20.955289', '2022-07-08 16:47:20.955289', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c09622f09ad8233ecd', 'shek sadham', '9606211344', 0, '', '2022-07-08 17:20:07.484957', '2022-07-08 17:20:07.484957', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('24dbc3dc2fd6ce8fd5', 'debashish das', '9019413440', 0, '', '2022-07-08 17:21:36.588010', '2022-07-08 17:21:36.588010', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d78653199e72eb4507', 'gorang', NULL, 0, '', '2022-07-08 17:33:38.543154', '2022-07-08 17:33:38.543154', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4d63cf41a9b8859753', 'nabo', NULL, 0, '', '2022-07-08 17:53:54.483579', '2022-07-08 17:53:54.483579', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0fee044386d7cc7d36', 'pradeep  patro', NULL, 0, '', '2022-07-08 18:05:54.115904', '2022-07-08 18:05:54.115904', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('802d64d0d93cb51d25', 'surjeet', NULL, 30, '', '2022-07-08 18:14:06.409608', '2022-07-08 18:14:06.409608', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a1a92064d18f9597d', 'shahid', NULL, 0, '', '2022-07-08 18:28:19.130968', '2022-07-08 18:28:19.130968', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62c7914562c0a8023e', 'ramkrishna', NULL, 30, '', '2022-07-08 18:30:40.095801', '2022-07-08 18:30:40.095801', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dfb1d656f0924c808e', 'gaurav', NULL, 0, '', '2022-07-08 18:40:32.746128', '2022-07-08 18:40:32.746128', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('179a9fbae11f32408c', 'gojodhar', NULL, 0, '', '2022-07-08 18:41:41.417323', '2022-07-08 18:41:41.417323', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fe23117592836de0b7', 'anand bappa', NULL, 0, '', '2022-07-08 18:48:54.807367', '2022-07-08 18:48:54.807367', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('775273fcaffdaf8d82', 'amal santra', '9880952733', 0, '', '2022-07-08 19:02:26.057911', '2022-07-08 19:02:26.057911', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('24e254b255b2c7513a', 'surjeet maithye', NULL, 0, '', '2022-07-08 19:06:02.631220', '2022-07-08 19:06:02.631220', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7d4e58005d299b16e0', 'babu doliye', '9538432615', 0, '', '2022-07-08 19:31:43.386466', '2022-07-08 19:31:43.386466', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('49571daf655c268c50', 'hansar jems', NULL, 0, '', '2022-07-08 19:36:20.595883', '2022-07-08 19:36:20.595883', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('47c98ffbf06114ca06', 'nithyanand', NULL, 0, '', '2022-07-08 20:04:16.272278', '2022-07-08 20:04:16.272278', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('780de3d183a74925a2', 'barun panja', '8147369585', 0, '', '2022-07-08 20:47:06.443991', '2022-07-08 20:47:06.443991', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62778aa21583a5f0df', 'sushanth patra', '9980816237', 0, '', '2022-07-09 10:37:34.076389', '2022-07-09 10:37:34.076389', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e40e23e09dd841f5f2', 'sagar', NULL, 0, '', '2022-07-09 11:07:10.645094', '2022-07-09 11:07:10.645094', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e15b668223a402a42a', 'shubhash', NULL, 30, '', '2022-07-09 11:19:49.654387', '2022-07-09 11:19:49.654387', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('baf98690aeae4da725', 'karthik sawantho', NULL, 30, '', '2022-07-09 11:41:41.132548', '2022-07-09 11:41:41.132548', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3f1452aceb07f60c19', 'sanjeet santra', '9902831065', 30, '', '2022-07-09 11:45:48.730503', '2022-07-09 11:45:48.730503', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a26bf685543b9e0326', 's.p.d', NULL, 30, '', '2022-07-09 11:57:00.789577', '2022-07-09 11:57:00.789577', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f02597cf497c0a5e57', 'sudeep bera', '9740545775', 0, '', '2022-07-09 12:44:47.047574', '2022-07-09 12:44:47.047574', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a113c50465542e476b', 'sapan mandal', '8147245651', 0, '', '2022-07-09 13:09:34.703837', '2022-07-09 13:09:34.703837', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4cb7b0988cee39d70f', 'sudeep maithye', '9035912276', 0, '', '2022-07-09 13:16:44.879259', '2022-07-09 13:16:44.879259', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c8bfd1f39c1b232c05', 'sukur', NULL, 0, '', '2022-07-09 14:12:42.170468', '2022-07-09 14:12:42.170468', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c413d27ac367ed2a9d', 'rathan raj', '9986378688', 0, '', '2022-07-09 14:24:09.270758', '2022-07-09 14:24:09.270758', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c1b6fa0ca9d49639d7', 'sadham', NULL, 0, '', '2022-07-09 14:46:29.369064', '2022-07-09 14:46:29.369064', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1ef6e7dabf3cdad8eb', 'kallipadu gorai', '6363010784', 0, '', '2022-07-09 15:23:26.201229', '2022-07-09 15:23:26.201229', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3b4d64825d4f4f1455', 'biswajeet rang', '6364428086', 0, '', '2022-07-09 16:13:17.494118', '2022-07-09 16:13:17.494118', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cd0586d06dc29ad32b', 'debu maithye', '9064285464', 0, '', '2022-07-09 16:48:46.861113', '2022-07-09 16:48:46.861113', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea85c869e714fcf0e9', 'ajith', NULL, 0, '', '2022-07-09 16:52:40.842362', '2022-07-09 16:52:40.842362', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2e911a6e0661879397', 'sudharshan hajra', '9606243717', 0, '', '2022-07-09 17:32:45.505019', '2022-07-09 17:32:45.505019', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0e702f3b4ec249fefb', 'vilas sawantho', '9886140185', 0, '', '2022-07-09 18:18:35.855283', '2022-07-09 18:18:35.855283', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('062dc2344fcd2bc652', 'afsar ali', '9880017963', 0, '', '2022-07-09 18:34:30.376349', '2022-07-09 18:34:30.376349', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2b77f4b3664a9824de', 'manas', NULL, 0, '', '2022-07-09 18:53:28.112108', '2022-07-09 18:53:28.112108', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('752c1d15b1a922e1c5', 'bablu das', '9036136458', 0, '', '2022-07-09 18:59:56.931705', '2022-07-09 18:59:56.931705', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('959a5f7841f7fe8cb3', 'prakash', NULL, 0, '', '2022-07-09 19:04:34.706208', '2022-07-09 19:04:34.706208', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8264bffa3fcb6b969a', 'somnath khanra', '6362479290', 0, '', '2022-07-09 19:11:19.678499', '2022-07-09 19:11:19.678499', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('794665b507665b6210', 'uthham mida', '8861710338', 0, '', '2022-07-09 19:53:42.904739', '2022-07-09 19:53:42.904739', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7b2fcedfac9b90c4fb', 'bappan', NULL, 0, '', '2022-07-09 20:14:38.324843', '2022-07-09 20:14:38.324843', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('face346cb163ac4e55', 'siraj ali', '8618770198', 0, '', '2022-07-09 20:22:44.066995', '2022-07-09 20:22:44.066995', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d37a40f9c4aba8dcc6', 'madhav hazra', '9632085407', 30, '', '2022-07-09 21:24:52.148688', '2022-07-09 21:24:52.148688', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f4168a7c97d7c35fd9', 'goutham sardar', NULL, 0, '', '2022-07-09 21:35:46.014196', '2022-07-09 21:35:46.014196', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('093922ce93b86fd5e6', 'nathu das', '9057204553', 0, '', '2022-07-10 11:04:58.761153', '2022-07-10 11:04:58.761153', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ba0966a2f9fa2213e1', 'tapan dey', '8553096310', 0, '', '2022-07-10 11:40:56.493449', '2022-07-10 11:40:56.493449', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c4589d7ed977841a6c', 'izaz', NULL, 0, '', '2022-07-10 11:43:13.988114', '2022-07-10 11:43:13.988114', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('43add5034883f7ef0f', 'nandu mandal', NULL, 60, '', '2022-07-10 11:52:34.592717', '2022-07-10 11:52:34.592717', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c2da1fa04ac14f44f', 'chiranjeet panja', '7483072774', 0, '', '2022-07-10 12:02:46.155679', '2022-07-10 12:02:46.155679', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7b442b1b5b5b85eb50', 'prashanjeet', NULL, 0, '', '2022-07-10 12:21:06.696747', '2022-07-10 12:21:06.696747', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('168e3b8966970d28c0', 'shakti sawanto', '9844226376', 0, '', '2022-07-10 12:30:45.062829', '2022-07-10 12:30:45.062829', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('125a55e3620fa20577', 'tarak ruhidas', NULL, 0, '', '2022-07-10 12:46:01.207033', '2022-07-10 12:46:01.207033', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('490e84b10b510844dd', 'prasanjeet', NULL, 60, '', '2022-07-10 13:26:04.985489', '2022-07-10 13:26:04.985489', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c52748e1d9069ccbfe', 'shantanu', NULL, 0, '', '2022-07-10 13:39:26.851429', '2022-07-10 13:39:26.851429', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0098a5ccb9af396956', 'chotu', NULL, 0, '', '2022-07-10 13:52:10.174491', '2022-07-10 13:52:10.174491', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9e7586e560d999db04', 'asit shankar', '9380077873', 0, '', '2022-07-10 14:03:43.160718', '2022-07-10 14:03:43.160718', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3f987965d332b1641e', 'pintu rhu das', '6360835260', 0, '', '2022-07-11 10:54:07.111194', '2022-07-11 10:54:07.111194', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('77d529f83ac2d9e536', 'Rintu patra', '9007191426', 0, '', '2022-07-11 11:03:46.787426', '2022-07-11 11:03:46.787426', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('46f5bb7721e1dc3bd5', 'anshuman', NULL, 0, '', '2022-07-11 12:02:50.120023', '2022-07-11 12:02:50.120023', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7e5b5134c7c0bfceee', 'ajay malik', '9632248326', 0, '', '2022-07-11 12:57:16.737094', '2022-07-11 12:57:16.737094', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ca6d238af7384609f8', 'raju poriya', '9883806415', 0, '', '2022-07-11 13:01:35.726472', '2022-07-11 13:01:35.726472', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6dce996b66de6b7710', 'naushad malik', '8050682669', 0, 'set 9731727875', '2022-07-11 13:44:47.204842', '2022-07-11 13:44:47.204842', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5a5561721b6bdc545b', 'soilen adak', '9945737456', 0, '', '2022-07-11 13:46:39.924198', '2022-07-11 13:46:39.924198', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bad12f4dab8b7c400c', 'ranjtu', NULL, 0, '', '2022-07-11 13:49:21.133861', '2022-07-11 13:49:21.133861', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0faf894419a47d7011', 'shanti jewels', NULL, 0, '', '2022-07-11 14:05:29.383347', '2022-07-11 14:05:29.383347', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('664099e882010a0ce4', 'nibhas', NULL, 0, '', '2022-07-11 14:14:37.180586', '2022-07-11 14:14:37.180586', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('abe60abb3929ff0762', 'smriti', NULL, 0, '', '2022-07-11 14:45:25.968363', '2022-07-11 14:45:25.968363', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('996746c63f924c7b9a', 'vanita', NULL, 0, '', '2022-07-11 14:46:49.904302', '2022-07-11 14:46:49.904302', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('289ed1cdbc908f8b18', 'suman karmakar', '9353065179', 0, '', '2022-07-11 15:32:12.895029', '2022-07-11 15:32:12.895029', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('45eee7b66c75c51fec', 'govind bhai', NULL, 1770, '', '2022-07-11 17:39:58.976157', '2022-07-11 17:39:58.976157', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b0fd8e6740e0da10dd', 'padma', NULL, 50, '', '2022-07-11 19:17:42.021587', '2022-07-11 19:17:42.021587', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4d1e54e0c16f2721f9', 'sk saluadin', NULL, 30, '', '2022-07-11 19:22:45.017165', '2022-07-11 19:22:45.017165', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8c6e5d1aedb30797f8', 'tapas panja', '7760654571', 0, '', '2022-07-11 19:48:38.330861', '2022-07-11 19:48:38.330861', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3916148bb43066a00d', 'goutham gorang', '9741805469', 0, '', '2022-07-11 20:32:07.264594', '2022-07-11 20:32:07.264594', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('66211e30d03cdf5aca', 'samuel', NULL, 0, '', '2022-07-11 20:34:43.018011', '2022-07-11 20:34:43.018011', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fbfcd68e8a99dfd227', 'abhijeet patra', '9382007663', 0, '', '2022-07-11 20:36:49.360148', '2022-07-11 20:36:49.360148', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a9053095f8a3bebdc4', 'nithin karmakar', '8197918716', 0, '', '2022-07-11 21:40:02.177884', '2022-07-11 21:40:02.177884', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('16c32215ef7cdbb539', 'abhijeet das', NULL, 0, '', '2022-07-12 10:59:48.363894', '2022-07-12 10:59:48.363894', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4b0b2a2ae32ecd51a0', 'subendu karmakar', NULL, 0, '', '2022-07-12 11:01:43.736416', '2022-07-12 11:01:43.736416', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3810dd372d33520ed8', 'abhijeet dass', '9742623361', 0, '', '2022-07-12 11:11:05.889673', '2022-07-12 11:11:05.889673', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c903b6cad2a2915680', 'pavan', NULL, 0, '', '2022-07-12 11:26:16.395175', '2022-07-12 11:26:16.395175', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('827599bff2a30a0b44', 'surjeet pramanik', NULL, 0, '', '2022-07-12 11:38:09.020844', '2022-07-12 11:38:09.020844', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('be4bf06a86cedf2cd1', 'akbar', NULL, 0, '', '2022-07-12 11:50:33.266481', '2022-07-12 11:50:33.266481', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dcca8a148855469007', 'siddhu saren', '9019807855', 0, '', '2022-07-12 11:51:59.385852', '2022-07-12 11:51:59.385852', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d139ffb97ac4dc30e4', 'denu', NULL, 0, '', '2022-07-12 12:09:32.140434', '2022-07-12 12:09:32.140434', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('33fa3c6d32a103a451', 'prashanth', NULL, 0, '', '2022-07-12 12:15:57.584152', '2022-07-12 12:15:57.584152', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('afda2ef61407b45b23', 'bojo', NULL, 0, '', '2022-07-12 12:16:26.577028', '2022-07-12 12:16:26.577028', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('918f9452cefe1d14b4', 'sanju', NULL, 0, '', '2022-07-12 12:21:37.559408', '2022-07-12 12:21:37.559408', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('149e4e1eb46537d64f', 'tarak', NULL, 0, '', '2022-07-12 12:28:13.068495', '2022-07-12 12:28:13.068495', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('58409f9fe7142e66c5', 'vijay', NULL, 60, '', '2022-07-12 12:40:09.456365', '2022-07-12 12:40:09.456365', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e495477ab8bdf6e3c0', 'sadhanand', NULL, 0, '', '2022-07-12 12:47:34.363733', '2022-07-12 12:47:34.363733', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c8d4d2152c3e97e8fd', 'dena bandu', NULL, 0, '', '2022-07-12 12:59:15.058896', '2022-07-12 12:59:15.058896', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('440dc5246f45a20d78', 'ijaz', NULL, 0, '', '2022-07-12 13:16:36.787372', '2022-07-12 13:16:36.787372', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ef249efb65fcd3141b', 'saifudin', NULL, 0, '', '2022-07-12 14:11:59.756103', '2022-07-12 14:11:59.756103', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dab8c1a600ea5cd489', 'abhijeet pal', '8884119243', 30, '', '2022-07-12 15:00:16.742146', '2022-07-12 15:00:16.742146', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4445d0a0c69e1d15d3', 's.j', NULL, 0, '', '2022-07-12 15:02:06.428583', '2022-07-12 15:02:06.428583', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7ecdebec2d82ad0771', 'sandeep kole', '7829082935', 0, '', '2022-07-12 15:19:45.925156', '2022-07-12 15:19:45.925156', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a1d18afab4e2bcda5e', 'sushanth padra', NULL, 0, '', '2022-07-12 15:47:54.042286', '2022-07-12 15:47:54.042286', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2ab39ffedf15a0511a', 'ranjeet jana', NULL, 0, '', '2022-07-12 16:22:35.876741', '2022-07-12 16:22:35.876741', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('29df5ba8c052dfeaae', 'ramesh', NULL, 0, '', '2022-07-12 17:09:55.997667', '2022-07-12 17:09:55.997667', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ad844a46199f90c29e', 'tarun', NULL, 0, '', '2022-07-12 17:41:09.050834', '2022-07-12 17:41:09.050834', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d51cf4d8946ff5a83', 'santu khantha', '8095366010', 0, '', '2022-07-12 18:08:25.769348', '2022-07-12 18:08:25.769348', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3386bb485c3420c7bc', 'rajkumar badak', '9019404823', 0, '', '2022-07-12 18:12:51.040217', '2022-07-12 18:12:51.040217', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7bd9de9f2f5f72182a', 'nawab jana', '9022845669', 0, '', '2022-07-12 18:13:41.988671', '2022-07-12 18:13:41.988671', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bc9ec4fa305b6d9852', 'sadhananad', NULL, 0, '', '2022-07-12 18:47:14.483836', '2022-07-12 18:47:14.483836', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2b37599f625bd21b82', 'kalli', NULL, 0, '', '2022-07-12 19:28:37.585498', '2022-07-12 19:28:37.585498', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa9aec7d62d8b08d0c', 'bhagirat', NULL, 0, '', '2022-07-12 20:38:29.365269', '2022-07-12 20:38:29.365269', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2cd6039d0d3599577b', 'goutham dhara', NULL, 0, '', '2022-07-12 20:45:51.108138', '2022-07-12 20:45:51.108138', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2a977fb07d27f35e88', 'prashanth karmakar', NULL, 0, '', '2022-07-12 20:59:04.682222', '2022-07-12 20:59:04.682222', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a122e7082ee6ee45b6', 'narayan', NULL, 0, '', '2022-07-12 21:14:15.917291', '2022-07-12 21:14:15.917291', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('83dc8a81f793e4fb90', 'mahesh', NULL, 60, '', '2022-07-12 21:27:41.351474', '2022-07-12 21:27:41.351474', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f347a6be928b893ac8', 'samar jana', '8670615754', 0, '', '2022-07-13 10:24:58.920604', '2022-07-13 10:24:58.920604', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('91318a2da7c13471b3', 'abhi mandal', '9354849903', 0, '', '2022-07-13 10:55:56.302923', '2022-07-13 10:55:56.302923', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ee4f454491fac9efa', 'nirmal maithi', NULL, 0, '', '2022-07-13 11:25:44.346255', '2022-07-13 11:25:44.346255', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('681345016f2530dfbf', 'nandu mondal', NULL, 30, '', '2022-07-13 11:58:29.713691', '2022-07-13 11:58:29.713691', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('57f1307267cee95305', 'sushanth gosh', NULL, 0, '', '2022-07-13 12:34:49.256348', '2022-07-13 12:34:49.256348', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cb07f87de4d5ee4353', 'amar sawanthu', '8618922721', 0, '', '2022-07-13 12:53:46.432148', '2022-07-13 12:53:46.432148', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('483764ddcc23a6adf0', 'sanjay mushair', NULL, 0, '', '2022-07-13 13:17:20.457984', '2022-07-13 13:17:20.457984', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9395fc8df2661df23d', 'sameer samantho', NULL, 0, '', '2022-07-13 13:34:20.390224', '2022-07-13 13:34:20.390224', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9c88509813543af899', 'ajith soni', NULL, 0, '', '2022-07-13 14:09:13.985776', '2022-07-13 14:09:13.985776', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1d57d2961f574ba7e4', 'utpal', NULL, 0, '', '2022-07-13 14:26:48.287850', '2022-07-13 14:26:48.287850', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0d211a584da1abca74', 'nasim', NULL, 0, '', '2022-07-13 14:53:32.119305', '2022-07-13 14:53:32.119305', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9c30612ebbe761a629', 'rono', NULL, 0, '', '2022-07-13 15:22:10.638115', '2022-07-13 15:22:10.638115', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('743c61b1d351b4e89a', 'bablu polish', NULL, 0, '', '2022-07-13 15:24:26.397746', '2022-07-13 15:24:26.397746', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f4c3f8cb0c5ebb4504', 'hari', NULL, 0, '', '2022-07-13 16:01:44.150236', '2022-07-13 16:01:44.150236', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4600bed7f51ab32d59', 'j p', NULL, 0, '', '2022-07-13 16:06:43.572059', '2022-07-13 16:06:43.572059', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a25703202db55ba262', 'asto', '7483974709', 0, '', '2022-07-13 16:09:48.897213', '2022-07-13 16:09:48.897213', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fe4e45e5daa69ab8c4', 'sk saludin+', NULL, 0, '', '2022-07-13 16:28:08.664168', '2022-07-13 16:28:08.664168', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ad940252d4ac88aee4', 'anmol jewels', NULL, 0, '', '2022-07-13 16:29:21.463691', '2022-07-13 16:29:21.463691', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('46c8afa11b92d1c19b', 'piyathosh', NULL, 0, '', '2022-07-13 17:58:39.256296', '2022-07-13 17:58:39.256296', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('af121b73c35b5a99ce', 'm c balaji', NULL, 0, '', '2022-07-13 18:14:14.851306', '2022-07-13 18:14:14.851306', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0c1ce71ba62dab1227', 'sharif', NULL, 0, '', '2022-07-13 18:39:56.168600', '2022-07-13 18:39:56.168600', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5a29a8fd6188e60146', 'sayed', NULL, 0, '', '2022-07-13 19:16:57.839342', '2022-07-13 19:16:57.839342', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('11fbbe0e5cd509affa', 'sharif da', NULL, 0, '', '2022-07-13 20:01:15.107986', '2022-07-13 20:01:15.107986', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7e7f8c2623884f2ddc', 'samuel maithye', NULL, 0, '', '2022-07-13 20:16:23.331885', '2022-07-13 20:16:23.331885', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cbd95821de65709349', 'yashwanth', NULL, 50, '', '2022-07-13 20:28:52.615096', '2022-07-13 20:28:52.615096', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6d9798e9304f5810b9', 'shantha', NULL, 0, '', '2022-07-13 20:56:26.195569', '2022-07-13 20:56:26.195569', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5e16148c36703004d7', 'ravi', NULL, 30, '', '2022-07-13 21:23:29.896295', '2022-07-13 21:23:29.896295', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('19b16d8aa497269908', 'amit maithye', '8072460428', 0, '', '2022-07-14 10:41:46.788024', '2022-07-14 10:41:46.788024', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2ec738f81d8df773fc', 'samresh', NULL, 0, '', '2022-07-14 11:12:22.756720', '2022-07-14 11:12:22.756720', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('af8753cb956237a6cd', 'shankar kandal', '6360247512', 0, '', '2022-07-14 11:39:12.283190', '2022-07-14 11:39:12.283190', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('54d466e0875ba3116a', 'gopal acharya', NULL, 0, '', '2022-07-14 12:02:40.671839', '2022-07-14 12:02:40.671839', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1ab40e79b1257b179e', 'izijzul', NULL, 0, '', '2022-07-14 13:08:45.033894', '2022-07-14 13:08:45.033894', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fc541579fc6502677b', 'sudarshan hazra', '8073428007', 0, '', '2022-07-14 14:07:34.407465', '2022-07-14 14:07:34.407465', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('01fe864b583530cdad', 'bibas', NULL, 0, '', '2022-07-14 14:34:09.916420', '2022-07-14 14:34:09.916420', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('780921551f0fead51a', 'De garuda J', NULL, 0, '', '2022-07-14 14:38:43.986185', '2022-07-14 14:38:43.986185', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e3382b3d19743e1236', 'arup mondal', NULL, 0, '', '2022-07-14 15:49:41.928299', '2022-07-14 15:49:41.928299', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4484aee9c772ee3763', 'pintu das', NULL, 0, '', '2022-07-14 17:07:10.685610', '2022-07-14 17:07:10.685610', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('17ca3a4106e317ec89', 'shekar', NULL, 0, '', '2022-07-14 18:11:17.971616', '2022-07-14 18:11:17.971616', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('28a139998770285203', 'govind', NULL, 470, '', '2022-07-14 18:37:07.926050', '2022-07-14 18:37:07.926050', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('97c82ab1db4e613f0f', 'swadesh', NULL, 30, '', '2022-07-14 20:08:08.711257', '2022-07-14 20:08:08.711257', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dd0c137c76c7d3bcbd', 'gopi', NULL, 0, '', '2022-07-14 20:38:14.050566', '2022-07-14 20:38:14.050566', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0c9128a342344b55ef', 'gajodhar', NULL, 0, '', '2022-07-14 20:48:59.867073', '2022-07-14 20:48:59.867073', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('178dea74852521f44a', 'bhaskar', NULL, 60, '', '2022-07-14 20:53:43.019964', '2022-07-14 20:53:43.019964', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('094eb93fdd8392b69a', 'subhir', NULL, 150, '', '2022-07-14 21:15:57.792959', '2022-07-14 21:15:57.792959', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bdbb1be6a2b22ee190', 'dhananjai', NULL, 0, '', '2022-07-14 21:20:34.076905', '2022-07-14 21:20:34.076905', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9cf4a47beb13b4ed62', 'asim ghuyia', '9448712439', 0, '', '2022-07-15 10:40:46.623993', '2022-07-15 10:40:46.623993', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('444cb8371847f726e7', 'abhijeet maiti', '9932638339', 30, '', '2022-07-15 11:10:48.388551', '2022-07-15 11:10:48.388551', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b59c9de26d188f9bf2', 'deb', NULL, 0, '', '2022-07-15 12:22:33.189851', '2022-07-15 12:22:33.189851', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a279641edcbd49e46c', 'ram kanji', NULL, 0, '', '2022-07-15 12:26:33.860469', '2022-07-15 12:26:33.860469', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9bf892c426824495d7', 'uttam sawantho', NULL, 30, '', '2022-07-15 12:35:16.542883', '2022-07-15 12:35:16.542883', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('214f93a568ee34e0ed', 'nikhar jewellers', NULL, 0, '', '2022-07-15 12:48:51.000328', '2022-07-15 12:48:51.000328', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('617ef5d27ad59bc4ac', 'sukdev', NULL, 0, '', '2022-07-15 13:10:53.230903', '2022-07-15 13:10:53.230903', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3e23fc38eabcbc25f7', 'nithayanand', NULL, 0, '', '2022-07-15 13:39:27.394173', '2022-07-15 13:39:27.394173', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b42447b6bdf19b26b1', 'nitin karmakar', NULL, 0, '', '2022-07-15 13:48:14.781745', '2022-07-15 13:48:14.781745', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d45d35ac77c378e1bf', 'milan malik', NULL, 0, '', '2022-07-15 14:14:28.971449', '2022-07-15 14:14:28.971449', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('134e6ad2e1ce8b64df', 'gourav', NULL, 0, '', '2022-07-15 14:18:17.692147', '2022-07-15 14:18:17.692147', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('73c64097c2f45158db', 'pradeep', NULL, 0, '', '2022-07-15 14:41:43.520268', '2022-07-15 14:41:43.520268', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ac2552bbd49631ea74', 'kumar', NULL, 0, '', '2022-07-15 15:57:49.616048', '2022-07-15 15:57:49.616048', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('48124fe227dd3c78e8', 'ganesh pal', NULL, 0, '', '2022-07-15 16:07:17.867536', '2022-07-15 16:07:17.867536', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('26ad190788f24e4349', 'sheik sameer', NULL, 0, '', '2022-07-15 18:27:44.017883', '2022-07-15 18:27:44.017883', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('91a05b60d66b7e2051', 'anarul', NULL, 0, '', '2022-07-15 18:56:00.902334', '2022-07-15 18:56:00.902334', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('566a4819dfc9aab11f', 'sameer', NULL, 0, '', '2022-07-15 19:00:46.669271', '2022-07-15 19:00:46.669271', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9314c3ac6224a15a7e', 'subho das', NULL, 0, '', '2022-07-15 19:13:06.919859', '2022-07-15 19:13:06.919859', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('189eda34f8da242786', 'shubhankar', NULL, 0, '', '2022-07-15 19:27:34.287331', '2022-07-15 19:27:34.287331', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0e38cf9765aee486fa', 'sheik', NULL, 0, '', '2022-07-16 11:45:31.126529', '2022-07-16 11:45:31.126529', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e166313b147fe5dd1a', 'raju sadra', NULL, 0, '', '2022-07-16 12:13:09.775446', '2022-07-16 12:13:09.775446', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f11faedc39739faca4', 'nagar', NULL, 0, '', '2022-07-16 12:17:38.653237', '2022-07-16 12:17:38.653237', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9596f06cfe5cb6cbbf', 'gopal malik', NULL, 0, '', '2022-07-16 12:18:39.386947', '2022-07-16 12:18:39.386947', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5a2b09a38f67ee24f7', 'moliye das', NULL, 0, '', '2022-07-16 12:25:03.240614', '2022-07-16 12:25:03.240614', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('69d130410786303f5e', 'nithai maji', NULL, 0, '', '2022-07-16 12:30:28.854114', '2022-07-16 12:30:28.854114', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7d9431a445b0a293f1', 'kishore', NULL, 0, '', '2022-07-16 12:37:41.203419', '2022-07-16 12:37:41.203419', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1d60c1c9f21f826e3b', 'nantu', NULL, 0, '', '2022-07-16 12:55:59.792922', '2022-07-16 12:55:59.792922', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2b63f017976d93ba80', 'bidya', NULL, 0, '', '2022-07-16 12:59:05.943170', '2022-07-16 12:59:05.943170', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4630915cd3bb9de602', 'vishnu', NULL, 0, '', '2022-07-16 13:32:15.453984', '2022-07-16 13:32:15.453984', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f4e58f9a3785c42f59', 'mintu', NULL, 30, '', '2022-07-16 13:40:17.411895', '2022-07-16 13:40:17.411895', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1f9c1c1c3a27b8e4b2', 'jhangir', NULL, 0, '', '2022-07-16 15:17:14.881705', '2022-07-16 15:17:14.881705', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa128768b8e23afe82', 'subrotho', NULL, 0, '', '2022-07-16 15:38:55.841428', '2022-07-16 15:38:55.841428', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('010a9a11960df270cc', 'hemanth', NULL, 0, '', '2022-07-16 17:10:44.818548', '2022-07-16 17:10:44.818548', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('448e54557fe22f4ad7', 'dinesh', NULL, 0, '', '2022-07-16 18:02:18.936896', '2022-07-16 18:02:18.936896', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fbde94a41f9e063f01', 'murthy', NULL, 0, '', '2022-07-16 18:24:20.749151', '2022-07-16 18:24:20.749151', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9dd8ef05075e3fac98', 'rahul', NULL, 0, '', '2022-07-16 18:33:55.649036', '2022-07-16 18:33:55.649036', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e9d2dfa442c135d8e6', 'paras', NULL, 30, '', '2022-07-16 19:44:18.155834', '2022-07-16 19:44:18.155834', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bd741bfae44ef7c3c5', 'cintu', NULL, 0, '', '2022-07-16 19:57:12.711635', '2022-07-16 19:57:12.711635', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2e8f6980b302c566f5', 'mukesh', NULL, 0, '', '2022-07-16 20:23:10.018159', '2022-07-16 20:23:10.018159', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5f86a17ed6bd9c4eea', 'abhijeet dang', '9900455960', 0, '', '2022-07-16 20:41:43.617439', '2022-07-16 20:41:43.617439', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d29b1a5de9b87e5f37', 'lakshmi naryan  pal', '9886169718', 0, '', '2022-07-17 11:08:47.004188', '2022-07-17 11:08:47.004188', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c4068143ddc53d8074', 'sajal bera', '9019658116', 0, '', '2022-07-17 12:03:25.880233', '2022-07-17 12:03:25.880233', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6a1890d1ca01837a6e', 'suman sasmal', '9535869158', 0, '', '2022-07-17 12:45:52.227629', '2022-07-17 12:45:52.227629', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9dc36ab494fe212f5b', 'akram', NULL, 0, '', '2022-07-17 13:10:28.959240', '2022-07-17 13:10:28.959240', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('96c61dd0411490b336', 'chandrashekar pn', NULL, 0, '', '2022-07-17 13:26:45.572071', '2022-07-17 13:26:45.572071', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d312d841e74c0957c', 'amit', NULL, 0, '', '2022-07-17 13:54:13.878750', '2022-07-17 13:54:13.878750', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8337273dc87c4ed9ba', 'zahir', NULL, 0, '', '2022-07-17 14:11:41.944636', '2022-07-17 14:11:41.944636', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e8bc9fb7ac77db21dd', 'a j m', NULL, 0, '', '2022-07-17 14:31:25.853636', '2022-07-17 14:31:25.853636', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('640bccb1a9a6cad20d', 'sushantho', NULL, 0, '', '2022-07-17 14:41:15.359655', '2022-07-17 14:41:15.359655', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f2d7b2b11a01ab4e25', 'rajkumar malik', NULL, 0, '', '2022-07-17 14:41:51.169446', '2022-07-17 14:41:51.169446', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b611c9e831acc82d3d', 'bimal', NULL, 0, '', '2022-07-17 14:50:15.371394', '2022-07-17 14:50:15.371394', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0260ca27987095d296', 'nandu bher', NULL, 0, '', '2022-07-17 14:53:12.867180', '2022-07-17 14:53:12.867180', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a3c233fd95376c612a', 'ashok pal', NULL, 0, '', '2022-07-17 14:56:07.809561', '2022-07-17 14:56:07.809561', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1b4a1b45e15a33e39b', 'trishika arun', NULL, 0, '', '2022-07-18 11:05:14.904608', '2022-07-18 11:05:14.904608', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d40db82c530cecc749', 'abhi mondal', NULL, 0, '', '2022-07-18 11:33:42.008708', '2022-07-18 11:33:42.008708', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a83e48b38e3cc3ffbc', 'jambu', NULL, 0, '', '2022-07-18 12:02:35.236489', '2022-07-18 12:02:35.236489', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('79a84e261e0709d838', 's k', NULL, 90, '', '2022-07-18 12:30:03.699213', '2022-07-18 12:30:03.699213', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1bed39317a26353fff', 'goutham sarkar', '9845984113', 30, '', '2022-07-18 12:40:50.889772', '2022-07-18 12:40:50.889772', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e4781c7a1fae88f897', 'goutham', NULL, 0, '', '2022-07-18 13:18:53.913519', '2022-07-18 13:18:53.913519', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('511175daddc11bda38', 'm j', NULL, 0, '', '2022-07-18 13:43:43.686134', '2022-07-18 13:43:43.686134', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d17fea631207fa17eb', 'ajay', NULL, 0, '', '2022-07-18 14:05:50.897736', '2022-07-18 14:05:50.897736', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60788af1d4a27a095d', 'ujjal', NULL, 0, '', '2022-07-18 14:50:26.306325', '2022-07-18 14:50:26.306325', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('64dadd4d7a0a20bb7d', 'shanthi', NULL, 0, '', '2022-07-18 17:17:41.592112', '2022-07-18 17:17:41.592112', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ce3e513046818ee166', 'toufique', NULL, 0, '', '2022-07-18 17:25:17.172732', '2022-07-18 17:25:17.172732', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7c94a93e08e07c9a34', 'samar bore', NULL, 0, '', '2022-07-18 17:30:33.272601', '2022-07-18 17:30:33.272601', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6d13bf61f076f286dd', 'shabhir tali', NULL, 0, '', '2022-07-18 19:23:23.312026', '2022-07-18 19:23:23.312026', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('230bb57052738c89a0', 's k saluadhin', NULL, 0, '', '2022-07-18 20:12:51.504665', '2022-07-18 20:12:51.504665', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('468f7abd306861b3b4', 'manik', NULL, 0, '', '2022-07-18 21:00:56.283377', '2022-07-18 21:00:56.283377', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d1d6d9467ef93c97d6', 'sapan bera', '6296513797', 0, '', '2022-07-19 10:00:09.372501', '2022-07-19 10:00:09.372501', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a0ff57f6c7fa34f4bd', 'm.b.j', NULL, 0, '', '2022-07-19 10:39:43.034513', '2022-07-19 10:39:43.034513', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ed2474545be2fcbbe4', 'sintu', NULL, 0, '', '2022-07-19 12:00:20.220824', '2022-07-19 12:00:20.220824', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8656a7b4dc2fdce9ef', 'suman', NULL, 0, '', '2022-07-19 12:40:49.345897', '2022-07-19 12:40:49.345897', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('de664e21c6cbc12a9a', 'nithaye', NULL, 0, '', '2022-07-19 12:46:45.988618', '2022-07-19 12:46:45.988618', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0b4155e3d719dc0493', 'rani', NULL, 0, '', '2022-07-23 14:59:19.846552', '2022-07-23 14:59:19.846552', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2e8f59631c911fece1', 'mintu panja', '9742539655', 0, '', '2022-07-23 19:57:53.882047', '2022-07-23 19:57:53.882047', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('46756628cae798769f', 'mohan', NULL, 0, '', '2022-07-27 12:41:46.236183', '2022-07-27 12:41:46.236183', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('68669bc6c2870aa059', 'uttham maithi', NULL, 0, '', '2022-07-30 19:21:39.895545', '2022-07-30 19:21:39.895545', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4ab3d084eaed8df126', 'sunrise', NULL, 0, '', '2022-07-30 21:20:45.262709', '2022-07-30 21:20:45.262709', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('18eac053b81689734a', 'yasin', NULL, 0, '', '2022-07-31 13:02:37.397653', '2022-07-31 13:02:37.397653', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b4584667bcfd2675fe', 'saheb', NULL, 0, '', '2022-08-01 10:39:14.476750', '2022-08-01 10:39:14.476750', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa47c889fac7564fb9', 'manoj kole', NULL, 0, '', '2022-08-01 11:21:37.092620', '2022-08-01 11:21:37.092620', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9043c46ecd2efd78a1', 's r', NULL, 0, '', '2022-08-01 12:41:16.155837', '2022-08-01 12:41:16.155837', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2233593bea39148cf5', 'modi', NULL, 0, '', '2022-08-01 13:15:35.335098', '2022-08-01 13:15:35.335098', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('00ff1092a782e521ec', 'rajkumar', NULL, 0, '', '2022-08-01 14:41:47.497709', '2022-08-01 14:41:47.497709', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('77a0025abd4b1f03ca', 'arjun', NULL, 50, '', '2022-08-01 16:18:22.174888', '2022-08-01 16:18:22.174888', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ae3b9d616b989bea08', 'prasad', NULL, 0, '', '2022-08-01 16:19:14.086005', '2022-08-01 16:19:14.086005', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('490c71f1f4c5e4dbb8', 'arup', NULL, 0, '', '2022-08-01 16:54:14.474802', '2022-08-01 16:54:14.474802', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bfb33cceaf47437514', 'n.g', NULL, 0, '', '2022-08-01 20:24:40.245565', '2022-08-01 20:24:40.245565', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('615217fdc51648153b', 'raghu', NULL, 0, '', '2022-08-02 10:21:36.444182', '2022-08-02 10:21:36.444182', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c089b36e1c438cb5f4', 'manohar das', NULL, 0, '', '2022-08-02 11:13:45.106910', '2022-08-02 11:13:45.106910', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cd517025e0d8abbe82', 'anup bhai', NULL, 0, '', '2022-08-02 11:14:56.292585', '2022-08-02 11:14:56.292585', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('64e964be7ed4cad628', 'sharvan kumar', NULL, 0, '', '2022-08-02 11:56:10.343801', '2022-08-02 11:56:10.343801', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3496b730b1edfed212', 'nawab', NULL, 0, '', '2022-08-02 12:34:32.398118', '2022-08-02 12:34:32.398118', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('933dd847fcc5731aa8', 'buddhadev', NULL, 0, '', '2022-08-02 12:41:36.008443', '2022-08-02 12:41:36.008443', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a2472d239644bab5dc', 'buddhadev 1', NULL, 0, '', '2022-08-02 12:42:04.973734', '2022-08-02 12:42:04.973734', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4eccf7209fd2d7627b', 'dewakar', NULL, 0, '', '2022-08-02 17:21:12.572711', '2022-08-02 17:21:12.572711', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8803f024713d6c741e', 'bappa', NULL, 0, '', '2022-08-02 17:24:29.179775', '2022-08-02 17:24:29.179775', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bc24c01fe7ea9154db', 'samar3', NULL, 0, '', '2022-08-02 19:14:16.093900', '2022-08-02 19:14:16.093900', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ccaf6795443e2861d1', 'bappi vishwas', '8073490810', 0, '', '2022-08-02 20:20:23.883586', '2022-08-02 20:20:23.883586', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ac29467773ecc66260', 'nazibull', NULL, 0, '', '2022-08-02 21:15:29.560335', '2022-08-02 21:15:29.560335', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fb817b4dd1ad2161b1', 'shubashish', NULL, 0, '', '2022-08-03 10:16:59.184669', '2022-08-03 10:16:59.184669', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d328943d1b40d0a284', 'naveen kumar', NULL, 0, '', '2022-08-03 10:18:13.318938', '2022-08-03 10:18:13.318938', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b3ce47933ec8692f6a', 'parimal', NULL, 0, '', '2022-08-03 12:05:18.113703', '2022-08-03 12:05:18.113703', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ec2139f49ad36e1890', 'b man', NULL, 0, '', '2022-08-03 12:49:46.277195', '2022-08-03 12:49:46.277195', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('61358feb0c9b049956', 'nibas', NULL, 0, '', '2022-08-03 12:57:29.838984', '2022-08-03 12:57:29.838984', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('036d2f5a3a88a437eb', 'sameer pandit', NULL, 0, '', '2022-08-03 14:25:29.080804', '2022-08-03 14:25:29.080804', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3de074f9232a1af5ec', 'arun', NULL, 0, '', '2022-08-03 14:54:13.252601', '2022-08-03 14:54:13.252601', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c11e140be0f42d2ad', 'amar santra', NULL, 0, '', '2022-08-03 17:55:57.641365', '2022-08-03 17:55:57.641365', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4adcd4996c701340a3', 'chandi', NULL, 0, '', '2022-08-03 18:18:55.189449', '2022-08-03 18:18:55.189449', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('516606bb2b4302f2ed', 'sukumar', NULL, 30, '', '2022-08-03 18:59:40.041379', '2022-08-03 18:59:40.041379', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8499aebce113d53c07', 'd.k', NULL, 0, '', '2022-08-03 19:11:32.746247', '2022-08-03 19:11:32.746247', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aab22e9ab6a197d969', 'amar palit', '9164375319', 0, '', '2022-08-03 19:33:22.999634', '2022-08-03 19:33:22.999634', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5aa0f66c5f7f8c70d8', 'rajesh kole', '6360145874', 0, '', '2022-08-03 19:52:29.194394', '2022-08-03 19:52:29.194394', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8a7756d3fffba88645', 'karthik karmakar', '7679391163', 0, '', '2022-08-03 20:23:06.047430', '2022-08-03 20:23:06.047430', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aaea5f2b67bb6072c7', 'shakthi sawantho', '7829111028', 0, '', '2022-08-03 20:26:18.766510', '2022-08-03 20:26:18.766510', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('efbfda769e9b334372', 'sanjay samantho', NULL, 0, '', '2022-08-03 20:57:34.411861', '2022-08-03 20:57:34.411861', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f7e76a22b972cd1803', 's k asghar', NULL, 0, '', '2022-08-04 11:18:11.573631', '2022-08-04 11:18:11.573631', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6e2f383c606984cc54', 'kush', NULL, 0, '', '2022-08-04 12:53:16.793536', '2022-08-04 12:53:16.793536', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c56dc4cf75d9ae347f', 'laxminarayan', NULL, 30, '', '2022-08-04 13:29:29.959539', '2022-08-04 13:29:29.959539', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('34f8fabba3c02d0256', 'manoranjan', NULL, 0, '', '2022-08-04 13:40:21.183436', '2022-08-04 13:40:21.183436', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d80b8790f039193b9e', 'anand bera', NULL, 0, '', '2022-08-04 13:55:09.302706', '2022-08-04 13:55:09.302706', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2951a1dd9b31bde413', 'tuka', NULL, 0, '', '2022-08-04 13:59:17.470007', '2022-08-04 13:59:17.470007', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('51d70429237d73f01d', 'D GRADA jewel', NULL, 0, '', '2022-08-04 15:29:01.237393', '2022-08-04 15:29:01.237393', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2e8e9aa944ab0a4b2b', 'santu das', '9739587347', 0, '', '2022-08-04 16:00:21.347154', '2022-08-04 16:00:21.347154', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('400f48054efda0c6dd', 'ss', NULL, 0, '', '2022-08-04 16:09:18.841558', '2022-08-04 16:09:18.841558', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0b6513b8f4a5abc39b', 'tarun pal', '7676037004', 0, '', '2022-08-04 17:04:22.631632', '2022-08-04 17:04:22.631632', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e109b86f6e3c2c1c88', 'ram', NULL, 0, '', '2022-08-04 18:26:42.229877', '2022-08-04 18:26:42.229877', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('765cc61fb0ce02eec8', 'bijay', NULL, 0, '', '2022-08-04 18:49:12.329505', '2022-08-04 18:49:12.329505', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6d764d88917f6974af', 'harsha', NULL, 0, '', '2022-08-04 20:13:00.345336', '2022-08-04 20:13:00.345336', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cbb01f7a63f32e3bb1', 'harshad', NULL, 0, '', '2022-08-05 11:14:27.563724', '2022-08-05 11:14:27.563724', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa239ede93f6753a5f', 'panchu', NULL, 0, '', '2022-08-05 11:46:35.323501', '2022-08-05 11:46:35.323501', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d48a9980ab068f3b3e', 'arun soni', '9113979484', 0, '', '2022-08-05 12:10:38.871104', '2022-08-05 12:10:38.871104', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('430c41e66e3e7c7195', 'alok', NULL, 0, '', '2022-08-05 14:17:24.477315', '2022-08-05 14:17:24.477315', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9e0cb2138319f2195e', 'akash', NULL, 30, '', '2022-08-05 16:58:18.111024', '2022-08-05 16:58:18.111024', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7aaa9e923ab2d432fc', 'jaganath', NULL, 0, '', '2022-08-05 17:38:56.998442', '2022-08-05 17:38:56.998442', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4a5d992ab04473a6de', 'nimaye', NULL, 0, '', '2022-08-05 18:22:11.284516', '2022-08-05 18:22:11.284516', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2561a88630d6ee3ea6', 'vc', NULL, 0, '', '2022-08-05 19:06:45.967356', '2022-08-05 19:06:45.967356', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5dc23368558cd52925', 'moinuddin', NULL, 0, '', '2022-08-05 19:48:11.788071', '2022-08-05 19:48:11.788071', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('34715f6970fc6e720b', 'sandeep manna', '8867262618', 0, '', '2022-08-06 10:42:17.726845', '2022-08-06 10:42:17.726845', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a7997139e329b1e721', 'om', NULL, 0, '', '2022-08-06 11:15:05.531682', '2022-08-06 11:15:05.531682', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('53ec7cfccdaeed24b9', 'ambica j', NULL, 0, '', '2022-08-06 14:48:24.178159', '2022-08-06 14:48:24.178159', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e6cc36dc10fb04ff37', 'sapan', NULL, 0, '', '2022-08-06 16:06:04.616828', '2022-08-06 16:06:04.616828', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea6cd3a58909f67b48', 'debu', NULL, 0, '', '2022-08-06 16:24:38.227803', '2022-08-06 16:24:38.227803', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6cdf45adc0bd01c633', 'saurav', NULL, 0, '', '2022-08-06 16:53:03.894528', '2022-08-06 16:53:03.894528', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e4c4f25842de0d7858', 'lal', NULL, 0, '', '2022-08-06 18:18:11.023303', '2022-08-06 18:18:11.023303', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('df3332b6e3b586499a', 'gunadhar', NULL, 0, '', '2022-08-06 18:33:57.837698', '2022-08-06 18:33:57.837698', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6795d57de46eb32a0b', 'akash roy', NULL, 0, '', '2022-08-06 19:41:57.463862', '2022-08-06 19:41:57.463862', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('16082cbe25beb97b12', 'milan', NULL, 0, '', '2022-08-06 21:33:07.703863', '2022-08-06 21:33:07.703863', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5fa6ef78648a16ad02', 'shek jamal', '9047493797', 0, '', '2022-08-07 10:17:25.255703', '2022-08-07 10:17:25.255703', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('68e7ea3a0fd217050e', 'koushik', NULL, 0, '', '2022-08-07 10:55:38.348886', '2022-08-07 10:55:38.348886', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cc59ff88235a4ae74b', 'sanjay sarkar', NULL, 0, '', '2022-08-07 11:32:29.048393', '2022-08-07 11:32:29.048393', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8a3b6a9db2a4f4cf3b', 'nivas', NULL, 0, '', '2022-08-07 12:10:23.994199', '2022-08-07 12:10:23.994199', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('98bb84b93ad096e690', 'poltu', NULL, 0, '', '2022-08-07 12:47:16.399222', '2022-08-07 12:47:16.399222', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c3de73d0abaee08555', 'shyam chouhan', NULL, 0, '', '2022-08-07 13:16:52.420163', '2022-08-07 13:16:52.420163', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e68a2e3eb4aa726016', 'tapan', NULL, 0, '', '2022-08-07 13:36:47.153077', '2022-08-07 13:36:47.153077', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('afa863e97f35995b2f', 'raja', NULL, 0, '', '2022-08-07 14:05:43.791184', '2022-08-07 14:05:43.791184', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ae9ef2e506c53b08a3', 'sanjay guchhait', '9113641610', 0, '', '2022-08-08 10:29:00.098268', '2022-08-08 10:29:00.098268', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e0d1b267df8f0aad4e', 'suman mandal', '8892859250', 0, '', '2022-08-08 11:21:36.461462', '2022-08-08 11:21:36.461462', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ad4af938d04c56bbcf', 'sukumar pal', NULL, 0, '', '2022-08-08 11:22:47.635420', '2022-08-08 11:22:47.635420', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ed8cfa40562bf746cc', 'kajol', NULL, 0, '', '2022-08-08 12:29:09.785506', '2022-08-08 12:29:09.785506', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('425e16ad56754a7f80', 'uttham shek', NULL, 0, '', '2022-08-08 12:48:45.150480', '2022-08-08 12:48:45.150480', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c21743073ec3ef09a9', 'dino', NULL, 0, '', '2022-08-08 13:10:20.925654', '2022-08-08 13:10:20.925654', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('485213e4bdadc82018', 'sudharshan adak', NULL, 0, '', '2022-08-08 14:45:26.114064', '2022-08-08 14:45:26.114064', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bf8808f7b65f54989d', 'manak bhai', NULL, 0, '', '2022-08-08 15:18:45.326236', '2022-08-08 15:18:45.326236', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a0b8213f5c5f5b0960', 'rakesh', NULL, 30, '', '2022-08-08 15:44:04.099554', '2022-08-08 15:44:04.099554', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('69c9086f57abefc74f', 'sunil malik', NULL, 0, '', '2022-08-08 16:02:40.640490', '2022-08-08 16:02:40.640490', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f8d40ca3d9a6ed8efe', 'rajibul', NULL, 0, '', '2022-08-08 17:53:50.226030', '2022-08-08 17:53:50.226030', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9cd5e93aa0b57b0fef', 'raju shah', NULL, 0, '', '2022-08-08 18:22:13.900251', '2022-08-08 18:22:13.900251', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b2a2c260e770aa4976', 'samuel devnath', '7337663897', 30, '', '2022-08-08 19:20:53.056060', '2022-08-08 19:20:53.056060', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cdce4eb52ceaf392b7', 'rajeev das', NULL, 0, '', '2022-08-08 19:22:27.752659', '2022-08-08 19:22:27.752659', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a4fd982f6b3b0ffff6', 'tapas sawantho', NULL, 0, '', '2022-08-08 19:35:37.296787', '2022-08-08 19:35:37.296787', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('70d9470cacbb663194', 'om jewels', NULL, 0, '', '2022-08-08 19:58:04.299513', '2022-08-08 19:58:04.299513', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('254a74f1e019bf6a9f', 'srikanth', NULL, 0, '', '2022-08-08 20:16:38.788094', '2022-08-08 20:16:38.788094', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f2c3fe4c550238b563', 'shubankar', NULL, 0, '', '2022-08-08 20:58:40.688307', '2022-08-08 20:58:40.688307', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2240e2b9cc65b64d2c', 'munner', NULL, 0, '', '2022-08-08 21:35:47.348149', '2022-08-08 21:35:47.348149', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7dfbb8d44d2bb7c8db', 'srimantho', NULL, 0, '', '2022-08-09 12:34:55.339097', '2022-08-09 12:34:55.339097', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6b08cf5cb78b4a67f9', 'mithun', NULL, 0, '', '2022-08-09 14:45:53.033897', '2022-08-09 14:45:53.033897', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3653ed8309fe5b9d49', 'heera jewel palace', NULL, 0, '', '2022-08-09 15:25:38.296991', '2022-08-09 15:25:38.296991', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5bef9eeadb6979a02d', 'chandan', NULL, 0, '', '2022-08-09 15:31:03.005125', '2022-08-09 15:31:03.005125', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a927832b22100b25f8', 'nithyanando', NULL, 0, '', '2022-08-09 15:40:11.239381', '2022-08-09 15:40:11.239381', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b781bfaeb6f645d66d', 'jain.j', NULL, 330, '', '2022-08-09 15:49:59.564766', '2022-08-09 15:49:59.564766', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('758840e14690834b19', 'madhav', NULL, 0, '', '2022-08-09 15:54:26.184753', '2022-08-09 15:54:26.184753', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a0bad75b7a6d6b4020', 'sujit das', NULL, 0, '', '2022-08-09 16:27:33.937043', '2022-08-09 16:27:33.937043', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5726548f0c5067b19c', 'sameer sawanth', NULL, 0, '', '2022-08-09 18:05:07.768818', '2022-08-09 18:05:07.768818', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6f399b6187c67a0c71', 'amol', NULL, 0, '', '2022-08-09 21:14:03.970862', '2022-08-09 21:14:03.970862', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('26c39cc2ab9b7a0ab7', 'raja das', NULL, 0, '', '2022-08-09 21:17:09.362233', '2022-08-09 21:17:09.362233', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ee884844638c678ec0', 'uttam maithi', NULL, 0, '', '2022-08-10 12:02:54.513414', '2022-08-10 12:02:54.513414', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6d03a8e79054064b40', 'somin', NULL, 0, '', '2022-08-10 13:07:14.590082', '2022-08-10 13:07:14.590082', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0f62d0e6fa2793f074', 'uttam jana', NULL, 0, '', '2022-08-10 13:11:29.432298', '2022-08-10 13:11:29.432298', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('233de94565076a5a4c', 'bidyuth', NULL, 0, '', '2022-08-10 13:13:51.220526', '2022-08-10 13:13:51.220526', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ff04e97e71f93a11a8', 'purshotam', NULL, 0, '', '2022-08-10 14:06:39.273623', '2022-08-10 14:06:39.273623', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a7fe1a8465324848e0', 'bappi', NULL, 120, '', '2022-08-10 14:29:44.449749', '2022-08-10 14:29:44.449749', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e226bc53448fee9e49', 'shashanku', NULL, 0, '', '2022-08-10 14:31:13.048985', '2022-08-10 14:31:13.048985', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('02e45ffe93d9ddf90c', 'babulal ji', NULL, 0, '', '2022-08-10 14:53:29.640293', '2022-08-10 14:53:29.640293', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6fdc5c7e463e66c7f4', 'amul', NULL, 0, '', '2022-08-10 15:04:40.217092', '2022-08-10 15:04:40.217092', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9b5cd4cb6762109f3f', 'kutub', NULL, 0, '', '2022-08-10 18:00:30.516993', '2022-08-10 18:00:30.516993', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32cbabc19eee04ed32', 'suresh jewels', NULL, 50, '', '2022-08-10 19:11:25.678734', '2022-08-10 19:11:25.678734', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a7f8eeb2df9093e91b', 'amar', NULL, 0, '', '2022-08-10 19:27:53.989775', '2022-08-10 19:27:53.989775', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('99d9d695daf96709d4', 'sanjay mandal', NULL, 0, '', '2022-08-10 21:29:45.035308', '2022-08-10 21:29:45.035308', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3a1ffeb23a638af78f', 'sameer bera', NULL, 0, '', '2022-08-11 12:29:20.885830', '2022-08-11 12:29:20.885830', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('15cbfbb85c0e122310', 'laltu', NULL, 0, '', '2022-08-11 13:22:36.622804', '2022-08-11 13:22:36.622804', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c0a47d3de3a653b8cd', 'asit', NULL, 0, '', '2022-08-11 13:25:26.632110', '2022-08-11 13:25:26.632110', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3279e82a00d97824be', 'pijush', NULL, 0, '', '2022-08-11 14:02:44.689692', '2022-08-11 14:02:44.689692', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b1b75b5822fdc8f120', 'bappan kar', '9743500178', 0, '', '2022-08-11 16:00:49.286183', '2022-08-11 16:00:49.286183', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d5d82aae8f3c33f48', 'madan', NULL, 0, '', '2022-08-11 16:19:12.628278', '2022-08-11 16:19:12.628278', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('92691ec59f17d551d4', 'mutha', NULL, 0, '', '2022-08-11 17:23:16.175556', '2022-08-11 17:23:16.175556', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d3d2292ec8fd5e22ec', 'pradeep dhore', '9538325113', 0, '', '2022-08-11 19:31:22.211148', '2022-08-11 19:31:22.211148', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('868fe11ee6392cb2b3', 'bhagirath', NULL, 0, '', '2022-08-11 21:37:55.263184', '2022-08-11 21:37:55.263184', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('827f7634a583bd53f0', 'deewakar', NULL, 0, '', '2022-08-12 10:54:00.093679', '2022-08-12 10:54:00.093679', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('678e700f7fc4e767e0', 'shadev', NULL, 0, '', '2022-08-12 11:49:15.295962', '2022-08-12 11:49:15.295962', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a0e24d7748169428b6', 'goutham bera', '9739469203', 80, '', '2022-08-12 12:04:49.673337', '2022-08-12 12:04:49.673337', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9c6ccf7b9e2f4e5595', 'kazim', NULL, 0, '', '2022-08-12 12:05:27.738428', '2022-08-12 12:05:27.738428', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2804e9ac9afdd8a788', 'rajat', NULL, 0, '', '2022-08-12 12:18:07.481333', '2022-08-12 12:18:07.481333', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('38aac65fcfc51803bb', 'kallipadu', NULL, 0, '', '2022-08-12 13:23:52.574726', '2022-08-12 13:23:52.574726', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('54308315ee1d01a616', 'as;hok j', NULL, 0, '', '2022-08-12 13:47:57.069839', '2022-08-12 13:47:57.069839', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2cb32f081b17ab2187', 'sayed musthari', NULL, 100, '', '2022-08-12 14:43:37.983236', '2022-08-12 14:43:37.983236', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('677c150daba42bced6', 'sovik', NULL, 0, '', '2022-08-12 16:12:33.840962', '2022-08-12 16:12:33.840962', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9349bfe7bd41fb4f6e', 'goutham saduka', NULL, 0, '', '2022-08-12 16:43:25.696570', '2022-08-12 16:43:25.696570', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b15e7090e86d78547d', 'abhijeet mondal', '9036383492', 0, '', '2022-08-12 17:10:17.463331', '2022-08-12 17:10:17.463331', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('410ecfbeff7a320711', 'sk bilal', NULL, 0, '', '2022-08-12 17:45:11.440517', '2022-08-12 17:45:11.440517', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1dad4d8fbab6641a9e', 'suraj', NULL, 0, '', '2022-08-12 19:52:38.892202', '2022-08-12 19:52:38.892202', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0ddaab021d835a655d', 'samar bour', NULL, 0, '', '2022-08-13 11:18:20.649353', '2022-08-13 11:18:20.649353', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0b082b97350ab14a3f', 'hasibull', NULL, 0, '', '2022-08-13 13:39:41.139776', '2022-08-13 13:39:41.139776', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('40b3e0489d21900420', 'malik', NULL, 0, '', '2022-08-13 14:17:12.492880', '2022-08-13 14:17:12.492880', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('87a29411bdde0f0169', 'jallu', NULL, 0, '', '2022-08-13 16:14:22.305840', '2022-08-13 16:14:22.305840', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9e1b2abd9ddd072d7a', 'yogesh', NULL, 0, '', '2022-08-13 16:23:48.699213', '2022-08-13 16:23:48.699213', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4515a64060f5fc10ba', 'kamlesh doaui', NULL, 0, '', '2022-08-13 16:53:17.707034', '2022-08-13 16:53:17.707034', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('514e5b4bd1e7b4607d', 'sujeet', NULL, 0, '', '2022-08-13 18:25:57.382396', '2022-08-13 18:25:57.382396', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('895f3617c29ec14eca', 'anand kumar', NULL, 0, '', '2022-08-13 19:02:47.964319', '2022-08-13 19:02:47.964319', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c738104d55401d73e2', 'montu kole', NULL, 0, '', '2022-08-13 21:02:13.417779', '2022-08-13 21:02:13.417779', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('40c4ca2cf6665ddea6', 'shravan', NULL, 0, '', '2022-08-14 10:42:07.414690', '2022-08-14 10:42:07.414690', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('487d59f2bacb33c255', 'goutham das', NULL, 0, '', '2022-08-14 10:43:02.636142', '2022-08-14 10:43:02.636142', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('30d4e35ec19f71545b', 'sk billal', NULL, 0, '', '2022-08-14 12:07:36.384168', '2022-08-14 12:07:36.384168', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fcf0b83a40db60cee8', 'habib', NULL, 60, '', '2022-08-14 13:02:39.809254', '2022-08-14 13:02:39.809254', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2e29546e7fb6556a33', 'nazrul', NULL, 0, '', '2022-08-14 13:16:16.561307', '2022-08-14 13:16:16.561307', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('88823110f2f5005edc', 'samuel das', NULL, 0, '', '2022-08-14 13:38:56.371030', '2022-08-14 13:38:56.371030', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bfa212ed3c0207e103', 'athawul', NULL, 0, '', '2022-08-14 14:13:15.644086', '2022-08-14 14:13:15.644086', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('01296e96d644b37b70', 'asim', NULL, 30, '', '2022-08-15 10:20:02.057694', '2022-08-15 10:20:02.057694', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8f26e75d56fc51089e', 'grt', NULL, 0, '', '2022-08-15 11:23:26.295570', '2022-08-15 11:23:26.295570', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('522a734acf6028ba25', 'bappi maithye', '9731758902', 0, '', '2022-08-15 12:22:24.779057', '2022-08-15 12:22:24.779057', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('978c77ff3f00dc9fc6', 'b h maji', NULL, 0, '', '2022-08-15 19:15:56.141606', '2022-08-15 19:15:56.141606', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cd6463f7442d498c21', 'sudeep pal', NULL, 0, '', '2022-08-16 13:10:29.311015', '2022-08-16 13:10:29.311015', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8ac5716b1769d13fba', 'KALI', NULL, 0, '', '2022-08-16 13:37:40.602958', '2022-08-16 13:37:40.602958', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ed0ce0db53ecdc3bb', 'deep', NULL, 0, '', '2022-08-16 15:26:00.581773', '2022-08-16 15:26:00.581773', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8764e916830c48700d', 'n.j', NULL, 0, '', '2022-08-16 16:12:09.217143', '2022-08-16 16:12:09.217143', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('55ab5906e027c6b6be', 's.n.j', NULL, 0, '', '2022-08-16 16:18:58.776505', '2022-08-16 16:18:58.776505', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4a7b5eed2b8e2adce7', 'ataul', NULL, 0, '', '2022-08-16 16:30:00.127388', '2022-08-16 16:30:00.127388', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6a4a3352c50d9d73bc', 'biswanath', NULL, 0, '', '2022-08-16 17:48:27.382113', '2022-08-16 17:48:27.382113', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fc614e0b7a7a3cb389', 'madan battacharya', '7044374232', 0, '', '2022-08-16 20:12:08.368144', '2022-08-16 20:12:08.368144', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b9bc6c46d1875e9572', 'somain', NULL, 0, '', '2022-08-17 10:41:24.242345', '2022-08-17 10:41:24.242345', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('13c37c6297b4efc09b', 'pappu', NULL, 0, '', '2022-08-17 12:30:45.238797', '2022-08-17 12:30:45.238797', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('814491d0e08e8b91a6', 'sujeet pramanik', '8250409446', 0, '', '2022-08-17 12:57:58.704048', '2022-08-17 12:57:58.704048', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('98e98075fbcbb8ca74', 'ganesh gayan', NULL, 0, '', '2022-08-17 14:28:24.370235', '2022-08-17 14:28:24.370235', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62d017701a547428fe', 'mahi gold', NULL, 0, '', '2022-08-17 15:18:36.396200', '2022-08-17 15:18:36.396200', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('80fe3ceb0f2c9e06ca', 'somain manna', NULL, 0, '', '2022-08-17 17:02:40.456623', '2022-08-17 17:02:40.456623', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c96e47d41f685ca6c7', 'hiralal', NULL, 0, '', '2022-08-17 18:54:11.815915', '2022-08-17 18:54:11.815915', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('79259a62198a804daf', 'lavanya', NULL, 0, '', '2022-08-18 15:16:09.227793', '2022-08-18 15:16:09.227793', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('61776a6bf1d5ae873f', 'm.p.s', NULL, 0, '', '2022-08-18 16:14:38.951037', '2022-08-18 16:14:38.951037', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6bf14310690ba9412b', 'gopal guya', NULL, 0, '', '2022-08-18 17:09:58.079102', '2022-08-18 17:09:58.079102', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9a3b95a128931d4bc6', 'purple', NULL, 0, '', '2022-08-19 11:31:06.270151', '2022-08-19 11:31:06.270151', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c1ff269543a6633f32', 'atar', NULL, 0, '', '2022-08-19 11:53:56.708080', '2022-08-19 11:53:56.708080', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cddfcec5f6ff40dca9', 'anand das', NULL, 0, '', '2022-08-19 12:37:01.938407', '2022-08-19 12:37:01.938407', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('00d08d64f995f24416', 'radhe govinda', NULL, 0, '', '2022-08-19 13:29:42.031134', '2022-08-19 13:29:42.031134', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4b105ee990cc32dcc7', 'polash bijli', '6360693283', 0, '', '2022-08-19 16:24:36.934862', '2022-08-19 16:24:36.934862', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('15ef237afe913fc2b4', 'm.n.s', NULL, 0, '', '2022-08-19 17:08:09.687913', '2022-08-19 17:08:09.687913', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('805c0de76a4fc35472', 'sharath', NULL, 0, '', '2022-08-19 17:35:21.411179', '2022-08-19 17:35:21.411179', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('28af8349f264c8a397', 'lakshmi vilas bank', NULL, -150, '', '2022-08-19 20:21:11.454518', '2022-08-19 20:21:11.454518', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f04a7e9dc3481a1f48', 'jayanth', NULL, 0, '', '2022-08-20 10:52:34.976801', '2022-08-20 10:52:34.976801', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('987ba09b4c01e011eb', 'naseem', NULL, 0, '', '2022-08-20 12:06:42.768630', '2022-08-20 12:06:42.768630', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62e7d408ddd51faa89', 's n j', NULL, 0, '', '2022-08-20 14:11:42.515248', '2022-08-20 14:11:42.515248', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f09319ac88ab9175b4', 'biswajeet jana', NULL, 0, '', '2022-08-20 14:21:11.005174', '2022-08-20 14:21:11.005174', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('161640b90127d403ef', 'samiul', NULL, 0, '', '2022-08-20 16:14:26.880236', '2022-08-20 16:14:26.880236', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a01a9e7ada4fd2f4b', 'rakesh rb', NULL, 0, '', '2022-08-20 16:38:14.007841', '2022-08-20 16:38:14.007841', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('99b70bfc8b63439213', 'billal', NULL, 0, '', '2022-08-20 17:46:22.123588', '2022-08-20 17:46:22.123588', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0cf9bd8fd9ac69337c', 'amar sadra', NULL, 0, '', '2022-08-20 20:02:33.148700', '2022-08-20 20:02:33.148700', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5aba808054bc5309ca', 'noor alam', NULL, 0, '', '2022-08-20 20:18:09.923580', '2022-08-20 20:18:09.923580', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('56b4a66cc4a41bbb79', 'yudhistar oraoo', '7975900466', 0, '', '2022-08-21 11:52:34.723228', '2022-08-21 11:52:34.723228', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0e5fbb51a335654633', 'nandan', NULL, 0, '', '2022-08-21 12:45:19.263855', '2022-08-21 12:45:19.263855', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8f502b9352aa4121b2', 'pintu', NULL, 30, '', '2022-08-21 13:16:32.731513', '2022-08-21 13:16:32.731513', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c13e3870f39d97c3b7', 'mangal', NULL, 0, '', '2022-08-21 14:13:15.003152', '2022-08-21 14:13:15.003152', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3bd199c52c3da12b56', 'padhyut hait', '6362852703', 0, '', '2022-08-22 10:29:35.498411', '2022-08-22 10:29:35.498411', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a6a27be76a47e8d6f1', 'sk raju ali', NULL, 0, '', '2022-08-22 11:56:57.294811', '2022-08-22 11:56:57.294811', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('58363bf51337857dd7', 'jhantu', NULL, 0, '', '2022-08-22 12:04:50.335198', '2022-08-22 12:04:50.335198', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b4052905421fcf801a', 'uttam sar', '9019699767', 0, '', '2022-08-22 12:16:13.950560', '2022-08-22 12:16:13.950560', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9eccd9cb63df79ec27', 'rajendar', NULL, 0, '', '2022-08-22 12:34:12.637639', '2022-08-22 12:34:12.637639', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('59881dafef7adbbe77', 'shashi', NULL, 0, '', '2022-08-22 12:53:44.773437', '2022-08-22 12:53:44.773437', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e6d211317cf1e3c883', 'deepankar', NULL, 30, '', '2022-08-22 13:32:57.548344', '2022-08-22 13:32:57.548344', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('681811afb0ff08770f', 'amith', NULL, 0, '', '2022-08-22 13:58:27.563624', '2022-08-22 13:58:27.563624', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('91634c1c24c06c9b37', 'mahadev', NULL, 30, '', '2022-08-22 14:32:09.835177', '2022-08-22 14:32:09.835177', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e79311e619539457fb', 'chandhan', NULL, 0, '', '2022-08-22 15:38:58.339765', '2022-08-22 15:38:58.339765', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('78c00b8988decd6958', 's k ajim', NULL, 0, '', '2022-08-22 16:48:20.091781', '2022-08-22 16:48:20.091781', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62cf398c700d03abc7', 'buddha ram', NULL, 0, '', '2022-08-22 17:19:44.956130', '2022-08-22 17:19:44.956130', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6fdb2c170d55d9c05a', 'karthik.j', NULL, 0, '', '2022-08-22 20:34:01.330688', '2022-08-22 20:34:01.330688', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b883755a1ed696042e', 'tuka das', '9448536110', 0, '', '2022-08-23 10:27:57.819744', '2022-08-23 10:27:57.819744', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('63a54ea9692b97944d', 'kajal', NULL, 0, '', '2022-08-23 11:29:16.004382', '2022-08-23 11:29:16.004382', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f360d2fd74ceb62d2c', 'ranjith', NULL, 0, '', '2022-08-23 11:34:28.324482', '2022-08-23 11:34:28.324482', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f7d11970624bab322e', 'narayan singh', NULL, 0, '', '2022-08-23 12:42:12.164784', '2022-08-23 12:42:12.164784', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d40c2c4692a8d0a8c', 'barun jana', NULL, 0, '', '2022-08-23 16:35:07.009111', '2022-08-23 16:35:07.009111', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ad2d7be09bc9dce070', 'g j n', NULL, 0, '', '2022-08-23 17:05:50.490296', '2022-08-23 17:05:50.490296', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5f3c501a2b81d9d8d4', 'mahaveer ostwal', NULL, 0, '', '2022-08-23 17:46:27.881214', '2022-08-23 17:46:27.881214', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ff90e0ee5def1cd11', 'deependu', NULL, 0, '', '2022-08-23 18:36:58.176322', '2022-08-23 18:36:58.176322', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('08108e57d5f99a147e', 'bansi pal', NULL, 0, '', '2022-08-23 19:20:45.462825', '2022-08-23 19:20:45.462825', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('05378bc4296649f404', 'bansipal', NULL, 0, '', '2022-08-23 19:38:52.782228', '2022-08-23 19:38:52.782228', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c2c6a3b5e9f42e64f6', 'biswajeet maji', '8217321203', 0, '', '2022-08-23 20:21:01.448603', '2022-08-23 20:21:01.448603', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7a807c22b3980417dc', 'qutubudin', NULL, 0, '', '2022-08-23 21:35:02.292102', '2022-08-23 21:35:02.292102', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d5db08d7812c23617', 'gopal', NULL, 0, '', '2022-08-24 11:35:45.381307', '2022-08-24 11:35:45.381307', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fbd73ad03d83921d39', 'nazim', NULL, 0, '', '2022-08-24 13:44:39.352848', '2022-08-24 13:44:39.352848', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c9f28dc89a99e22e1', 'sham', NULL, 0, '', '2022-08-24 14:15:30.499684', '2022-08-24 14:15:30.499684', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('85a8b386a6b815df4a', 'sameeran', NULL, 0, '', '2022-08-24 14:44:07.515391', '2022-08-24 14:44:07.515391', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d842a35540cc57d391', 'subhojeet patra', NULL, 0, '', '2022-08-24 15:52:53.486973', '2022-08-24 15:52:53.486973', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ba8be0ac556485844b', 'yudistar', NULL, 0, '', '2022-08-24 16:32:23.222543', '2022-08-24 16:32:23.222543', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eeddabb3d9c7751c06', 'kailash', NULL, 0, '', '2022-08-24 16:51:17.109270', '2022-08-24 16:51:17.109270', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9b37bc257d93b3ed68', 'D GARUDA JEWEL', NULL, 0, '', '2022-08-24 17:02:25.861338', '2022-08-24 17:02:25.861338', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('989bfb305ef8847454', 's k motilal', NULL, 0, '', '2022-08-24 17:20:06.669908', '2022-08-24 17:20:06.669908', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('24bf8329c6784ba541', 'bharath', NULL, 30, '', '2022-08-24 18:12:20.953310', '2022-08-24 18:12:20.953310', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b77415cae8c8ad55f3', 'jagdish', NULL, 0, '', '2022-08-24 18:31:56.917553', '2022-08-24 18:31:56.917553', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ca17fe0cf897718e07', 'm.k jain', NULL, 0, '', '2022-08-25 14:23:43.968663', '2022-08-25 14:23:43.968663', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('05510fa6ac62796df7', 'sanath', NULL, 0, '', '2022-08-25 18:13:41.365553', '2022-08-25 18:13:41.365553', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5fa8275dcb7f409b13', 'sudeep', NULL, 0, '', '2022-08-25 18:56:11.541409', '2022-08-25 18:56:11.541409', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c9ceba5cb0ed983dc', 'p.s.n', NULL, 0, '', '2022-08-25 19:24:42.763729', '2022-08-25 19:24:42.763729', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c4f5b187012dfcc4d2', 'animesh', NULL, 0, '', '2022-08-25 19:52:11.691466', '2022-08-25 19:52:11.691466', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ab284d6fb925437ffe', 'raju da', NULL, 0, '', '2022-08-26 15:12:12.767702', '2022-08-26 15:12:12.767702', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa28ae69c293bb3d14', 'r s', NULL, 0, '', '2022-08-26 16:10:15.004817', '2022-08-26 16:10:15.004817', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8e588ae61a71432d9c', 'tushar das', NULL, 0, '', '2022-08-26 16:59:41.708718', '2022-08-26 16:59:41.708718', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('91a0d332910895bba9', 'shyma', NULL, 0, '', '2022-08-26 17:47:58.643481', '2022-08-26 17:47:58.643481', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ff33f360914033edcb', 'nandhan', NULL, 0, '', '2022-08-26 19:06:23.303092', '2022-08-26 19:06:23.303092', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bad5c73a8b03ed094d', 'shakti', NULL, 0, '', '2022-08-26 20:43:29.385841', '2022-08-26 20:43:29.385841', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('993cd61c0a291e28a0', 'biswajeet  pandit', NULL, 0, '', '2022-08-26 20:50:44.380735', '2022-08-26 20:50:44.380735', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('98f73e435b6bec315d', 'debashish shee', '9880072542', 0, '', '2022-08-27 13:08:59.920462', '2022-08-27 13:08:59.920462', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4344a5eeacd8732891', 'annarul', NULL, 0, '', '2022-08-27 16:19:17.500982', '2022-08-27 16:19:17.500982', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('141d1beb50e84a8c8e', 'azizul', NULL, 0, '', '2022-08-27 17:21:50.337754', '2022-08-27 17:21:50.337754', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0f2e7a09afe830a63c', 'malayama', NULL, 0, '', '2022-08-27 20:06:30.132061', '2022-08-27 20:06:30.132061', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8a8fdac5fd4a45088c', 'vardhaman jewels', NULL, 0, '', '2022-08-28 11:57:32.845695', '2022-08-28 11:57:32.845695', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('38e46ee200fbf6fcaa', 'vipul', NULL, 0, '', '2022-08-28 12:00:41.717494', '2022-08-28 12:00:41.717494', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1cd2450ce63188a746', 'javed ali', NULL, 0, '', '2022-08-28 12:18:52.572723', '2022-08-28 12:18:52.572723', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8262276173de6a582c', 'mainudhin', NULL, 30, '', '2022-08-28 12:28:10.031204', '2022-08-28 12:28:10.031204', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('762ff395976995c5a0', 'motilal', NULL, 0, '', '2022-08-28 12:28:49.220618', '2022-08-28 12:28:49.220618', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0e941ee81301f3e394', 'om bhai', NULL, 0, '', '2022-08-28 12:37:12.078021', '2022-08-28 12:37:12.078021', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e99f6ff87ee03eec11', 'raju ali', NULL, 0, '', '2022-08-28 12:38:46.963735', '2022-08-28 12:38:46.963735', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8f8cd2b5e28018da8e', 'nandu', NULL, 0, '', '2022-08-28 13:00:22.189184', '2022-08-28 13:00:22.189184', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('77a8c8236c84cf47c0', 'fab india', NULL, 0, '', '2022-08-29 11:34:29.145548', '2022-08-29 11:34:29.145548', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a2e99febc90876d38e', 'anmol', NULL, 0, '', '2022-08-29 12:13:58.831059', '2022-08-29 12:13:58.831059', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f1a61c7813ba6b31a5', 'laxmikanth', NULL, 0, '', '2022-08-29 12:35:35.847437', '2022-08-29 12:35:35.847437', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('04511384704624fa20', 'partho', NULL, 0, '', '2022-08-29 12:46:10.330745', '2022-08-29 12:46:10.330745', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cb2e628c5c4b049ba4', 'bhadshah', NULL, 0, '', '2022-08-29 13:38:12.249783', '2022-08-29 13:38:12.249783', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3e12298713a98b38ee', 'apurva', NULL, 0, '', '2022-08-29 14:45:41.715655', '2022-08-29 14:45:41.715655', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6aa43c48bd1495eb05', 'sheikh habib', NULL, 0, '', '2022-08-29 15:01:42.826268', '2022-08-29 15:01:42.826268', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('84436af5d61107c4e6', 'maharaj', NULL, 0, '', '2022-08-29 15:56:14.828081', '2022-08-29 15:56:14.828081', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('34503ab37801872343', 'raju bhag', NULL, 0, '', '2022-08-29 21:28:39.417789', '2022-08-29 21:28:39.417789', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5e23e4f530c93fe2b8', 'joseph', NULL, 0, '', '2022-08-30 10:40:39.903953', '2022-08-30 10:40:39.903953', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('575c8cd3efd23eb68f', 'bidhyut', NULL, 0, '', '2022-08-30 14:29:55.609145', '2022-08-30 14:29:55.609145', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('587596c0f0286d7c8e', 'sbj', NULL, 170, '', '2022-08-30 16:50:19.553461', '2022-08-30 16:50:19.553461', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7a6483b959087b02a7', 'prasana', NULL, 0, '', '2022-08-30 17:06:13.106793', '2022-08-30 17:06:13.106793', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3ff4afbf29e97a9ce6', 'vicky', NULL, 0, '', '2022-08-30 20:39:34.562639', '2022-08-30 20:39:34.562639', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d23ab0a64ba0253754', 'uttam dey', '9740149846', 0, '', '2022-08-31 11:07:35.140289', '2022-08-31 11:07:35.140289', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('44ae8332698e5fd36c', 'deepak', NULL, 30, '', '2022-08-31 11:54:55.254150', '2022-08-31 11:54:55.254150', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('97bae89a4279f5da0d', 'suman jana', NULL, 0, '', '2022-08-31 13:17:23.221382', '2022-08-31 13:17:23.221382', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0486280d36d04e138a', 'sanjay mondal', NULL, 0, '', '2022-08-31 14:15:12.560058', '2022-08-31 14:15:12.560058', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a54b3c052d2cf21f62', 'saju', NULL, 0, '', '2022-08-31 14:44:03.955902', '2022-08-31 14:44:03.955902', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ae19e1adb6f4b6b93d', 'sudharshan', NULL, 0, '', '2022-08-31 15:01:12.059703', '2022-08-31 15:01:12.059703', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3e72025687f37e6df7', 'anil', NULL, 0, '', '2022-08-31 16:56:28.615225', '2022-08-31 16:56:28.615225', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8045dabcecaa6f329b', 'b j', NULL, 0, '', '2022-09-01 12:32:00.540148', '2022-09-01 12:32:00.540148', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('25d783a1bfab2d0eba', 'babu bhai', NULL, 0, '', '2022-09-01 12:43:05.613742', '2022-09-01 12:43:05.613742', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c7136389f5302f4aca', 'utpal bomik', NULL, 0, '', '2022-09-01 13:15:10.235433', '2022-09-01 13:15:10.235433', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('27c471c18152031d2b', 'mamu', NULL, 0, '', '2022-09-01 14:34:32.771682', '2022-09-01 14:34:32.771682', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d7cc0a6a10d65cb64f', 'jigar', NULL, 30, '', '2022-09-01 19:19:38.114141', '2022-09-01 19:19:38.114141', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3b150321412c88dfa3', 'raju mukarjee', NULL, 0, '', '2022-09-01 19:28:34.026551', '2022-09-01 19:28:34.026551', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('78f5f765ad464dcefb', 'deepu', NULL, 0, '', '2022-09-01 20:32:15.632926', '2022-09-01 20:32:15.632926', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('92dc3e11d9df615ace', 'shubhas', NULL, 0, '', '2022-09-02 10:54:57.025733', '2022-09-02 10:54:57.025733', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ff7a21c41a473c3c6b', 'bhavesh', NULL, 0, '', '2022-09-02 13:31:52.928155', '2022-09-02 13:31:52.928155', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ce6c09d7315eafa959', 'jeetu', NULL, 0, '', '2022-09-02 14:52:27.581830', '2022-09-02 14:52:27.581830', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('728d27db41441a8045', 'jayantu', NULL, 0, '', '2022-09-02 16:47:12.873702', '2022-09-02 16:47:12.873702', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d720848610ec5db6dc', 'munnirul', NULL, 0, '', '2022-09-02 16:47:43.299670', '2022-09-02 16:47:43.299670', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cfcb1a2daabffaca24', 'ashish santra', NULL, 0, '', '2022-09-02 18:00:45.537454', '2022-09-02 18:00:45.537454', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aef559cd17baf25f86', 'raj jewel', NULL, 0, '', '2022-09-02 18:49:10.928535', '2022-09-02 18:49:10.928535', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8fdd22903b809ec1d9', 's k j', NULL, 0, '', '2022-09-02 19:00:41.138666', '2022-09-02 19:00:41.138666', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e720410ba1b1781f5a', 'hanuman jee', NULL, 0, '', '2022-09-03 11:33:00.106535', '2022-09-03 11:33:00.106535', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d38d3c8b2c81c32a82', 'sanjay ghuya', NULL, 0, '', '2022-09-03 12:08:03.233190', '2022-09-03 12:08:03.233190', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4f380da9dd01a67698', 'm r', NULL, 0, '', '2022-09-03 12:54:43.491385', '2022-09-03 12:54:43.491385', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('628f888fc5747fada3', 'barun santra', '9019602207', 0, '', '2022-09-03 14:12:55.875469', '2022-09-03 14:12:55.875469', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9846b78690a7a47c34', 'kailash soni', NULL, 0, '', '2022-09-03 15:05:43.705708', '2022-09-03 15:05:43.705708', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d245ae748ce2452e8d', 'abhi', NULL, 0, '', '2022-09-03 16:04:12.698003', '2022-09-03 16:04:12.698003', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b4fc76da3c54d99611', 'ashadul', NULL, 0, '', '2022-09-03 16:12:31.356251', '2022-09-03 16:12:31.356251', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('17c014ee451be73cae', 'sheikh', NULL, 0, '', '2022-09-03 16:29:43.226153', '2022-09-03 16:29:43.226153', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aacf61031fdf39c11f', 'pintu panja', NULL, 0, '', '2022-09-03 18:41:39.592538', '2022-09-03 18:41:39.592538', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7c3cd6c9ff170bc9cc', 'girish', NULL, 0, '', '2022-09-03 19:07:33.053734', '2022-09-03 19:07:33.053734', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('138ac4c8a01e5e3808', 'alam gir', NULL, 0, '', '2022-09-03 19:08:47.933346', '2022-09-03 19:08:47.933346', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('27c4572911610fbb6d', 'samuresh', NULL, 0, '', '2022-09-04 10:08:16.010741', '2022-09-04 10:08:16.010741', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1c84187c284f147cf9', 'shivagami', NULL, 0, '', '2022-09-04 11:04:19.544989', '2022-09-04 11:04:19.544989', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8119d12f8fc6984584', 'kokan', NULL, 30, '', '2022-09-05 11:22:39.503188', '2022-09-05 11:22:39.503188', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e40206130692433dcf', 'saidul', NULL, 0, '', '2022-09-05 12:02:50.300411', '2022-09-05 12:02:50.300411', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a81c546f15925df32d', 'sajal pore', NULL, 0, '', '2022-09-05 12:30:35.289013', '2022-09-05 12:30:35.289013', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7954f2f07a4ac3e240', 'shivaram anna', NULL, 0, '', '2022-09-05 13:00:07.016736', '2022-09-05 13:00:07.016736', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('de22e79db786d15758', 'mek singh', NULL, 0, '', '2022-09-05 13:13:11.072515', '2022-09-05 13:13:11.072515', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('63bbc3857a3bb79acf', 'siddharth', NULL, 0, '', '2022-09-05 13:34:33.288222', '2022-09-05 13:34:33.288222', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('00ec729f7d6f47e589', 'sudarshan adak', '7204881269', 0, '', '2022-09-05 13:56:32.370955', '2022-09-05 13:56:32.370955', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('06d4b4ef0e3e211c64', 's k azim', NULL, 0, '', '2022-09-05 14:05:39.916637', '2022-09-05 14:05:39.916637', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dd64a92ecdd9518b95', 'shivam das', NULL, 0, '', '2022-09-05 14:38:54.932388', '2022-09-05 14:38:54.932388', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6e89b54f57c897d0bf', 'sushantho das', NULL, 0, '', '2022-09-05 16:03:51.503887', '2022-09-05 16:03:51.503887', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('95779a7d511f7ac9b3', 'nagesh', NULL, 30, '', '2022-09-05 17:06:56.790971', '2022-09-05 17:06:56.790971', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('98001f4523ad508365', 'humay;n', NULL, 0, '', '2022-09-05 17:42:53.250776', '2022-09-05 17:42:53.250776', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('171610350442334796', 'somu deep', NULL, 0, '', '2022-09-05 17:52:53.964937', '2022-09-05 17:52:53.964937', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ca434be53d77f4ffd4', 'poultu', NULL, 0, '', '2022-09-05 19:03:55.967751', '2022-09-05 19:03:55.967751', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('03b39aad4f0c60562e', 'jotan', NULL, 0, '', '2022-09-05 19:16:49.815319', '2022-09-05 19:16:49.815319', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d04996a66579825bad', 'shubhashsih', NULL, 0, '', '2022-09-05 19:19:27.903008', '2022-09-05 19:19:27.903008', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6b03dab83909fdaa14', 'chandu malik', NULL, 0, '', '2022-09-05 19:22:39.870644', '2022-09-05 19:22:39.870644', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('40d8a90fa6607d682b', 'santu pakira', '7019543344', 0, '', '2022-09-06 12:41:32.053335', '2022-09-06 12:41:32.053335', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('da325b20d1439be6b4', 'sitaram', NULL, 0, '', '2022-09-06 13:10:38.795671', '2022-09-06 13:10:38.795671', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('81b07214ac8a47035b', 'israfil', NULL, 0, '', '2022-09-06 14:48:56.377558', '2022-09-06 14:48:56.377558', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ac4dc191f2e216bb81', 'raju paikar', NULL, 0, '', '2022-09-06 17:09:42.150601', '2022-09-06 17:09:42.150601', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e86a1d1b8eed02c554', 'b l j b', NULL, 0, '', '2022-09-06 21:12:11.209454', '2022-09-06 21:12:11.209454', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('de020001349f476c97', 'rikesh', NULL, 0, '', '2022-09-07 10:38:11.164022', '2022-09-07 10:38:11.164022', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d89b0aa3f741af49f6', 'jhankar jewels', NULL, 0, '', '2022-09-07 10:50:23.605416', '2022-09-07 10:50:23.605416', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a44cd11a6452d4cfd2', 'ramesh bhai', NULL, 0, '', '2022-09-07 11:34:19.755837', '2022-09-07 11:34:19.755837', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c8d7cf2fd3dd9df17', 'abhijeet bhattacharya', NULL, 0, '', '2022-09-07 11:54:05.818252', '2022-09-07 11:54:05.818252', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('71a19ba64844573366', 'rajendra', NULL, 60, '', '2022-09-07 12:00:23.507321', '2022-09-07 12:00:23.507321', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('683159e531d885b5db', 'bappi da', NULL, 0, '', '2022-09-07 12:35:47.271720', '2022-09-07 12:35:47.271720', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('88d55e205b517da8df', 'SHEK HABIB', NULL, 0, '', '2022-09-07 13:57:40.346769', '2022-09-07 13:57:40.346769', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c93278c0d79664d7f9', 'P J', NULL, 0, '', '2022-09-07 15:43:08.572800', '2022-09-07 15:43:08.572800', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('932b63cc42fba7888a', 'nandu bhera', NULL, 0, '', '2022-09-07 17:19:14.483319', '2022-09-07 17:19:14.483319', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('402531fb7a037786ec', 'mahmood', NULL, 0, '', '2022-09-07 17:45:34.670890', '2022-09-07 17:45:34.670890', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('536d0f8f7e4ad8d84c', 'sushanth sk', NULL, 0, '', '2022-09-07 18:06:02.397627', '2022-09-07 18:06:02.397627', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('276ddc7646c2323838', 'viraj', NULL, 0, '', '2022-09-07 19:18:40.597657', '2022-09-07 19:18:40.597657', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f25ba5654904338aff', 's k raju', NULL, 0, '', '2022-09-07 21:43:32.214551', '2022-09-07 21:43:32.214551', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eb7d8ddff1dc959783', 'sourab das', '9972739085', 0, '', '2022-09-08 13:16:45.020255', '2022-09-08 13:16:45.020255', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('508d8f8248203aee63', 'mithun roy', NULL, 0, '', '2022-09-08 13:51:49.102342', '2022-09-08 13:51:49.102342', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('68e0606a023cdddc7b', 'dilip dey', NULL, 0, '', '2022-09-08 13:53:44.650557', '2022-09-08 13:53:44.650557', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2ac96d095408aec5c6', 'amith khamrai', NULL, 0, '', '2022-09-08 13:59:46.043107', '2022-09-08 13:59:46.043107', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('68ee74cdc89cefedb2', 'sameer hajra', NULL, 0, '', '2022-09-08 14:25:13.116714', '2022-09-08 14:25:13.116714', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('caa2a1e47ccada3ef9', 'sumantho', NULL, 0, '', '2022-09-08 16:27:50.089272', '2022-09-08 16:27:50.089272', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a20c94c2c18f5fd15', 'lalith ranka', NULL, 0, '', '2022-09-08 16:32:06.808371', '2022-09-08 16:32:06.808371', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d96cc513bdb73a9a24', 'b.s.p', NULL, 0, '', '2022-09-08 20:48:01.652859', '2022-09-08 20:48:01.652859', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa24368946593e8794', 'totan', NULL, 0, '', '2022-09-08 20:49:03.078308', '2022-09-08 20:49:03.078308', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cd7bdac5df40b2c65b', 'sanjeev mondal', NULL, 0, '', '2022-09-09 10:40:19.639897', '2022-09-09 10:40:19.639897', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ef4f90382fa6697975', 'shubhashish', NULL, 0, '', '2022-09-09 12:18:53.490820', '2022-09-09 12:18:53.490820', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a07c08753400cba17e', 'tapas das', '7019915271', 0, '', '2022-09-09 13:03:13.492899', '2022-09-09 13:03:13.492899', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('312bf50b99f6c801b7', 'p', NULL, 0, '', '2022-09-09 13:50:05.376651', '2022-09-09 13:50:05.376651', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c8174346c1894663dd', 'nishikanth', NULL, 0, '', '2022-09-09 13:58:46.326083', '2022-09-09 13:58:46.326083', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9998064a209ad74bf1', 'deepak malik', NULL, 0, '', '2022-09-09 14:20:11.133469', '2022-09-09 14:20:11.133469', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('af1818a897f24e2ba4', 'paras gold', NULL, 30, '', '2022-09-09 15:26:52.039228', '2022-09-09 15:26:52.039228', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('18fba0c382ca3a92e2', 'rathi kantho', NULL, 0, '', '2022-09-09 15:50:14.387779', '2022-09-09 15:50:14.387779', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2f73a189cd0912dc0a', 'sk', NULL, 0, '', '2022-09-10 11:12:30.186271', '2022-09-10 11:12:30.186271', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e3eda2f93c915bc8f8', 'gajendar sing', NULL, 0, '', '2022-09-10 12:48:03.398424', '2022-09-10 12:48:03.398424', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e1abef508fb111d620', 'm n s', NULL, 0, '', '2022-09-10 15:15:05.620180', '2022-09-10 15:15:05.620180', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4044c8345002b8dda9', 'n k', NULL, 0, '', '2022-09-10 17:12:27.669478', '2022-09-10 17:12:27.669478', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('29c0b26e7e9599a472', 'jakir', NULL, 0, '', '2022-09-10 17:37:22.397481', '2022-09-10 17:37:22.397481', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('df8fc8e9d00aab4e5d', 'mehul', NULL, 0, '', '2022-09-10 18:02:56.949376', '2022-09-10 18:02:56.949376', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4be623b168789dc96f', 'srimantho bera', NULL, 0, '', '2022-09-10 18:03:55.845572', '2022-09-10 18:03:55.845572', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d803de2b4ca509793b', 'surjeet manna', NULL, 0, '', '2022-09-10 19:42:35.981876', '2022-09-10 19:42:35.981876', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('56b1b0aeb653880ffd', 'nithaye das', NULL, 0, '', '2022-09-10 21:20:31.382997', '2022-09-10 21:20:31.382997', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a1e7b8a8b5c2362fe3', 'sakib', NULL, 0, '', '2022-09-11 13:02:38.132848', '2022-09-11 13:02:38.132848', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fd6000776c3720850b', 's k qutub', NULL, 0, '', '2022-09-11 13:04:17.075971', '2022-09-11 13:04:17.075971', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e6b6f152bca5e1eed3', 'sahid', NULL, 0, '', '2022-09-11 14:31:01.731393', '2022-09-11 14:31:01.731393', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6d3d6a477a209e467a', 'suk dev', NULL, 0, '', '2022-09-12 12:25:41.334084', '2022-09-12 12:25:41.334084', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e48db5b1b38dc67109', 'sama', NULL, 0, '', '2022-09-12 13:06:02.878389', '2022-09-12 13:06:02.878389', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0ae156c09e27e6903c', 'suken', NULL, 0, '', '2022-09-12 13:46:24.305193', '2022-09-12 13:46:24.305193', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('81c562f350880ba800', 'bhima j', NULL, 100, '', '2022-09-12 14:19:32.738578', '2022-09-12 14:19:32.738578', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b6c06c4b158feaea8a', 'kaushik', NULL, 0, '', '2022-09-12 15:12:53.698682', '2022-09-12 15:12:53.698682', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4fde4f265e7f3c7385', 'papu', NULL, 0, '', '2022-09-12 15:30:01.605826', '2022-09-12 15:30:01.605826', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6744724c7d72cd01de', 'xavier', NULL, 0, '', '2022-09-12 18:06:20.636901', '2022-09-12 18:06:20.636901', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('deeec0443d4574cf67', 'amit panja', NULL, 0, '', '2022-09-12 18:31:44.493654', '2022-09-12 18:31:44.493654', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7bfc4f2e8b8f69d237', 'ananth', NULL, 0, '', '2022-09-12 19:01:17.296034', '2022-09-12 19:01:17.296034', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a1536eaedbc86eff0e', 'santhosh', NULL, 0, '', '2022-09-12 19:08:09.306912', '2022-09-12 19:08:09.306912', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('da79e1bcb3424cba18', 'abhijeet roy', NULL, 0, '', '2022-09-12 19:35:22.522689', '2022-09-12 19:35:22.522689', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f3f3a1da7e2212e577', 'uttam', NULL, 0, '', '2022-09-13 11:04:56.927102', '2022-09-13 11:04:56.927102', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4905efc73ce29ea809', 'bachu', NULL, 0, '', '2022-09-13 12:21:30.602375', '2022-09-13 12:21:30.602375', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0ed1c98c50c4e2e99a', 'roshan', NULL, 0, '', '2022-09-13 12:52:13.467759', '2022-09-13 12:52:13.467759', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9e85577ef07126b0a5', 'paras jewels', NULL, 60, '', '2022-09-13 13:12:49.670355', '2022-09-13 13:12:49.670355', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('915bb09b5e43bbbf3c', 'durga', NULL, 0, '', '2022-09-13 15:44:06.906326', '2022-09-13 15:44:06.906326', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('070981a6bacfa7babb', 'subendu dhara', NULL, 0, '', '2022-09-13 16:06:15.333812', '2022-09-13 16:06:15.333812', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d2b89663d89eec1567', 'devnath dulai', NULL, 0, '', '2022-09-13 16:28:18.341484', '2022-09-13 16:28:18.341484', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bf97283a07d69f7464', 'baidynath', NULL, 0, '', '2022-09-13 16:31:44.956794', '2022-09-13 16:31:44.956794', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5264aa7befdfa43021', 'cintu maji', NULL, 0, '', '2022-09-13 17:12:20.346985', '2022-09-13 17:12:20.346985', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a48eef96814a875cea', 'r m', NULL, 0, '', '2022-09-13 17:22:44.061023', '2022-09-13 17:22:44.061023', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('990226a800515c8c68', 'akshay', NULL, 30, '', '2022-09-13 18:36:57.275356', '2022-09-13 18:36:57.275356', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('86773dd21a26dae2a3', 'tapas', NULL, 0, '', '2022-09-13 19:24:41.732243', '2022-09-13 19:24:41.732243', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dab8b625569d14e5d2', 'soidul', NULL, 0, '', '2022-09-13 19:25:06.098818', '2022-09-13 19:25:06.098818', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea9529a3549e975e3c', 'sonu', NULL, 0, '', '2022-09-13 20:02:37.120145', '2022-09-13 20:02:37.120145', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('19554f51ff2c89dcd5', 'kurbana;i', NULL, 0, '', '2022-09-13 20:40:56.585209', '2022-09-13 20:40:56.585209', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0780d8ed4aa35d6c65', 'biltu', NULL, 0, '', '2022-09-13 20:49:40.070767', '2022-09-13 20:49:40.070767', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('51b3e8e9159ba5d508', 'samuel malik', NULL, 0, '', '2022-09-14 10:16:38.705553', '2022-09-14 10:16:38.705553', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6027cb57b39b5970b6', 'samuel kor', NULL, 0, '', '2022-09-14 10:33:25.791366', '2022-09-14 10:33:25.791366', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('233eea58f1255e0455', 'tarun sawantho', NULL, 0, '', '2022-09-14 12:47:00.865316', '2022-09-14 12:47:00.865316', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1dea3da1385e22a594', 'uttham samantho', '9845803003', 0, '', '2022-09-14 13:11:31.331591', '2022-09-14 13:11:31.331591', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('84011f90dc8d5a06d5', 'hira jewel palace', NULL, 0, '', '2022-09-14 15:25:25.391377', '2022-09-14 15:25:25.391377', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d94e01ff54621be12', 'k d m', NULL, 0, '', '2022-09-14 15:33:48.246010', '2022-09-14 15:33:48.246010', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('617245ecd1bfbe4c19', 'a m muzakir', NULL, 0, '', '2022-09-14 15:48:23.141868', '2022-09-14 15:48:23.141868', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2101595ebf7ca37a17', 'sreenivas', NULL, 0, '', '2022-09-14 19:07:34.076447', '2022-09-14 19:07:34.076447', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f9f2f5da7e9bb48ffb', 'bola', NULL, 0, '', '2022-09-14 20:37:10.424889', '2022-09-14 20:37:10.424889', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a6ec56376cf2887c77', 'laluda', NULL, 0, '', '2022-09-14 21:18:00.406327', '2022-09-14 21:18:00.406327', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('994789844a49235886', 'kayam', NULL, 0, '', '2022-09-15 13:01:33.460421', '2022-09-15 13:01:33.460421', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('78875c7e6739cd74cf', 'tapas kundo', NULL, 0, '', '2022-09-15 18:35:31.546349', '2022-09-15 18:35:31.546349', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('620dfa13af8c935d79', 's.k salaudin', NULL, 0, '', '2022-09-15 20:26:18.716291', '2022-09-15 20:26:18.716291', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1ae8d8ea4cce75470e', 'ganesh modi', NULL, 0, '', '2022-09-15 21:21:33.426264', '2022-09-15 21:21:33.426264', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1b1aa547b07f7ca736', 'ajim', NULL, 0, '', '2022-09-16 10:32:57.169140', '2022-09-16 10:32:57.169140', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0da7885e13223d4809', 'sameer bare', NULL, 0, '', '2022-09-16 11:55:54.893592', '2022-09-16 11:55:54.893592', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8aee0bad9d54a6f933', 'arjuna jewels', NULL, 50, '', '2022-09-16 12:55:47.150379', '2022-09-16 12:55:47.150379', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c11fd00a9e228a8223', 'rajeev', NULL, 0, '', '2022-09-16 14:30:43.108486', '2022-09-16 14:30:43.108486', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0447fa21d8e40fd4bd', 'noor jaan', NULL, 0, '', '2022-09-16 15:08:42.883771', '2022-09-16 15:08:42.883771', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ee06e81d6407fc838f', 'chakravarty', NULL, 0, '', '2022-09-16 15:33:17.379451', '2022-09-16 15:33:17.379451', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e7157e753816c4ed50', 'megnath', NULL, 0, '', '2022-09-16 15:35:23.651669', '2022-09-16 15:35:23.651669', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f8ae874e4cfe89e8dd', 'barun', NULL, 0, '', '2022-09-16 18:10:15.914068', '2022-09-16 18:10:15.914068', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6cd05424fa4e29ae9c', 'sheik jamal', NULL, 0, '', '2022-09-17 13:50:37.400672', '2022-09-17 13:50:37.400672', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5e35758fc746ee009d', 'sunil', NULL, 0, '', '2022-09-17 13:55:57.386367', '2022-09-17 13:55:57.386367', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('072688b5c968d254c5', 'kuldeep', NULL, 0, '', '2022-09-19 16:51:10.296557', '2022-09-19 16:51:10.296557', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('06bf0056ad9caa6e59', 'anwar', NULL, 0, '', '2022-09-19 17:24:12.899194', '2022-09-19 17:24:12.899194', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('781d65dc3eae8ec1fb', 'sujay', NULL, 0, '', '2022-09-20 14:00:45.805435', '2022-09-20 14:00:45.805435', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7d964a1f2ec7421ada', 'farid', NULL, 0, '', '2022-09-20 14:27:22.886643', '2022-09-20 14:27:22.886643', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c4988d0277867e9754', 'popiye', NULL, 0, '', '2022-09-20 16:24:01.852856', '2022-09-20 16:24:01.852856', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6f87d71691f82a04f0', 'amith choudry', '9986691716', 0, '', '2022-09-20 16:31:01.542526', '2022-09-20 16:31:01.542526', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('878adf4d30d7cec151', 'mithun malik', NULL, 0, '', '2022-09-20 17:08:22.175131', '2022-09-20 17:08:22.175131', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8f6f1afcd16e5ab75d', 'ganesh rana', '7760879903', 0, '', '2022-09-20 17:35:34.042054', '2022-09-20 17:35:34.042054', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1d4e96600a78f85b42', 'anish', '9986554246', 0, '', '2022-09-20 19:18:58.054615', '2022-09-20 19:18:58.054615', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cd80b5df1b28e50a61', 'sumit', NULL, 0, '', '2022-09-20 20:08:58.194830', '2022-09-20 20:08:58.194830', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('04d521366744cabfc4', 'nill', NULL, 0, '', '2022-09-21 14:08:28.152483', '2022-09-21 14:08:28.152483', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('12755cb3d95378fae1', 'pintu sasmal', NULL, 0, '', '2022-09-21 15:16:23.427957', '2022-09-21 15:16:23.427957', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ec439ab870cf5207c2', 'm j v', NULL, 0, '', '2022-09-21 16:39:01.554881', '2022-09-21 16:39:01.554881', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('17c38554437cb24a6e', 'jaydev kotal', NULL, 0, '', '2022-09-21 17:14:50.494391', '2022-09-21 17:14:50.494391', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('af13e5275d65de66a6', 'deb ranjan', NULL, 0, '', '2022-09-21 18:50:08.049088', '2022-09-21 18:50:08.049088', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cf9ababcf97ac8dc2d', 'dev', NULL, 0, '', '2022-09-21 20:47:22.914364', '2022-09-21 20:47:22.914364', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0d3f1351afdcbfc578', 'BIJAN', NULL, 0, '', '2022-09-22 10:54:04.613800', '2022-09-22 10:54:04.613800', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7ff861c05e3b5e1343', 'DEBRANJAN', NULL, 0, '', '2022-09-22 11:36:53.616092', '2022-09-22 11:36:53.616092', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('859338462c7c7f1c02', 'DEBASHISH', NULL, 0, '', '2022-09-22 14:06:09.441101', '2022-09-22 14:06:09.441101', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c691ecd4fa1b294f1e', 'JAGADEESH', NULL, 50, '', '2022-09-22 14:07:05.918553', '2022-09-22 14:07:05.918553', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c6ece596be34d37323', 'ROBI GHODAI', '7483603939', 0, '', '2022-09-22 15:03:30.557704', '2022-09-22 15:03:30.557704', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('494fb06de492798f67', 'debaranjan', NULL, 0, '', '2022-09-22 19:34:05.097715', '2022-09-22 19:34:05.097715', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3c675a08a20b9a82de', 'faruq', NULL, 0, '', '2022-09-22 19:43:01.046948', '2022-09-22 19:43:01.046948', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('79ee8a337baf4aafa9', 'mahataj', NULL, 0, '', '2022-09-22 20:31:55.495039', '2022-09-22 20:31:55.495039', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('41b10aa9f12b552268', 'gopal ghori', '9379366767', 0, '', '2022-09-23 13:52:43.712068', '2022-09-23 13:52:43.712068', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a8f5361edeb4b97d0d', 'nithyanand maji', '9611226907', 0, '', '2022-09-23 14:01:38.175538', '2022-09-23 14:01:38.175538', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8e19ae359f185d6136', 'lob das', NULL, 0, '', '2022-09-23 14:38:27.138687', '2022-09-23 14:38:27.138687', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a2ace91313b6bfcd4e', 'narender ibrahim', NULL, 0, '', '2022-09-23 14:50:34.939121', '2022-09-23 14:50:34.939121', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2011c018d3bee58c9f', 'narendra', NULL, 0, '', '2022-09-23 14:56:16.260825', '2022-09-23 14:56:16.260825', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fa76e94aeee199cdbb', 'narender', NULL, 0, '', '2022-09-23 14:56:31.868642', '2022-09-23 14:56:31.868642', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ad71a4cf04270c6181', 'sk sharif', NULL, 0, '', '2022-09-23 16:31:38.629921', '2022-09-23 16:31:38.629921', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('81c29aeeacfe0b566d', 'tulsi j', NULL, 0, '', '2022-09-23 16:44:11.172910', '2022-09-23 16:44:11.172910', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8299315227d1541ec2', 'subho', NULL, 0, '', '2022-09-23 17:35:32.921089', '2022-09-23 17:35:32.921089', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e7d63cac2921e972d9', 'balvanth', NULL, 0, '', '2022-09-23 19:46:44.513507', '2022-09-23 19:46:44.513507', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f135a6088d3b39a096', 's.k', NULL, 0, '', '2022-09-23 21:38:23.958825', '2022-09-23 21:38:23.958825', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('abac9a6faf43d5b14f', 'mashiyar', '9620619417', 0, '', '2022-09-24 15:59:32.609709', '2022-09-24 15:59:32.609709', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('15ed911bbd5e822b3c', 'robin', NULL, 0, '', '2022-09-24 16:52:44.316262', '2022-09-24 16:52:44.316262', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c47cc29d8850b1874f', 'parveen', NULL, 0, '', '2022-09-24 17:33:32.436167', '2022-09-24 17:33:32.436167', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('848fa6a3be459d4cab', 'mousin', NULL, 0, '', '2022-09-24 19:14:19.617658', '2022-09-24 19:14:19.617658', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0b366d270a2aaa7a2d', 'keshav', NULL, 0, '', '2022-09-24 20:24:19.661821', '2022-09-24 20:24:19.661821', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7937b3ee83dc7699cf', 'tanmaye', NULL, 0, '', '2022-09-24 20:51:52.038691', '2022-09-24 20:51:52.038691', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fb609dabbeb95873e7', 'uttham pal', NULL, 0, '', '2022-09-25 10:38:29.471938', '2022-09-25 10:38:29.471938', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1bbdbe1271fd53ed54', 'noor', NULL, 0, '', '2022-09-25 11:56:49.598250', '2022-09-25 11:56:49.598250', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ed49124f5218100b6a', 'sagar pramanik', '9632765381', 60, '', '2022-09-25 13:16:32.159369', '2022-09-25 13:16:32.159369', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5f9921b74f96530784', 'indrajeet', NULL, 0, '', '2022-09-26 10:39:51.857881', '2022-09-26 10:39:51.857881', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bc3fd71a45c7d45394', 'anup', NULL, 30, '', '2022-09-26 10:54:24.721917', '2022-09-26 10:54:24.721917', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c3bcba6510710d3cff', 'rajath', NULL, 0, '', '2022-09-26 11:21:26.871044', '2022-09-26 11:21:26.871044', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5223b010d56bd6d762', 'krishna sasmal', NULL, 0, '', '2022-09-26 12:31:30.891791', '2022-09-26 12:31:30.891791', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('86e38600e60c0d0503', 'ssj', NULL, 0, '', '2022-09-26 13:35:25.787312', '2022-09-26 13:35:25.787312', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('923dbe38fd24ac8d71', 'siddharth godhaye', NULL, 0, '', '2022-09-26 13:44:09.411573', '2022-09-26 13:44:09.411573', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c93123ecd72b64034a', 'sisir adak', NULL, 0, '', '2022-09-26 14:19:23.283830', '2022-09-26 14:19:23.283830', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c5f55f077d872957d1', 'rajath bomik', '6363050127', 0, '', '2022-09-26 16:46:39.756402', '2022-09-26 16:46:39.756402', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ada49bfa2e99522de0', 'natraj', NULL, 0, '', '2022-09-26 18:43:15.300152', '2022-09-26 18:43:15.300152', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('256eb05e558ba0a34c', 'israfill', NULL, 0, '', '2022-09-26 21:20:28.980901', '2022-09-26 21:20:28.980901', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('df4bfae581617c547a', 'abdull', NULL, 0, '', '2022-09-26 21:22:43.158103', '2022-09-26 21:22:43.158103', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32b2f6f182ffed2f36', 'purnendu', NULL, 0, '', '2022-09-26 21:23:54.484945', '2022-09-26 21:23:54.484945', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c9b8e1a2803ce552d4', 'abhijeeth', NULL, 0, '', '2022-09-27 11:27:02.102166', '2022-09-27 11:27:02.102166', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8c1bd7d645d1293aa3', 'mr rajesh kumar', NULL, 0, '', '2022-09-27 11:31:17.580183', '2022-09-27 11:31:17.580183', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4fd2ffd75ea8ce7e4f', 'megh singh', NULL, 0, '', '2022-09-27 12:49:35.478697', '2022-09-27 12:49:35.478697', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('428744830c56e44790', 'sahadev pal', '9108352838', 0, '', '2022-09-27 13:03:23.992366', '2022-09-27 13:03:23.992366', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('89eda34a37f68da2bd', 's s jw', NULL, 0, '', '2022-09-27 14:46:21.852153', '2022-09-27 14:46:21.852153', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3e8861db85a0648ca9', 'hameera begam', NULL, 0, '', '2022-09-27 16:40:31.707156', '2022-09-27 16:40:31.707156', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9179a298d5f3d66fe9', 'faruk ali', '7676232117', 0, '', '2022-09-27 18:12:33.643508', '2022-09-27 18:12:33.643508', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3280b8a3804ef658ef', 'shyam bhunia', '9686633578', 0, '', '2022-09-27 19:29:24.824661', '2022-09-27 19:29:24.824661', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('40dfc9ae28548a078b', 'kudiram', NULL, 0, '', '2022-09-27 20:03:07.029216', '2022-09-27 20:03:07.029216', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cef80b502b6abab711', 'pankaj', NULL, 0, '', '2022-09-27 20:20:52.469666', '2022-09-27 20:20:52.469666', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bae16887f548b0303f', 'gour', NULL, 0, '', '2022-09-27 21:23:01.241896', '2022-09-27 21:23:01.241896', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('deee8c5fd466c30b12', 'tarak ruhi das', '8327682700', 0, '', '2022-09-28 11:25:03.025420', '2022-09-28 11:25:03.025420', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9358ece65ce1198e6c', 'rangachari', NULL, 0, '', '2022-09-28 11:36:11.593618', '2022-09-28 11:36:11.593618', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4d9b0b9e0475c3c44d', 'ranjeet 2', NULL, 0, '', '2022-09-28 13:16:29.577324', '2022-09-28 13:16:29.577324', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3ca4350a7d479a9ecb', 'ranjeet 3', NULL, 0, '', '2022-09-28 13:17:05.723742', '2022-09-28 13:17:05.723742', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a548445a66ac082492', 'shivu', NULL, 0, '', '2022-09-28 15:05:49.708336', '2022-09-28 15:05:49.708336', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f468a7b1731443ca92', 'chanchal', NULL, 0, '', '2022-09-28 15:57:31.286038', '2022-09-28 15:57:31.286038', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('628d42500a02206189', 'a m sameer', NULL, 0, '', '2022-09-28 17:44:08.394589', '2022-09-28 17:44:08.394589', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3d205b42f3459721ba', 'heru da', NULL, 0, '', '2022-09-28 18:00:46.271851', '2022-09-28 18:00:46.271851', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a49ac53f99b30d2f00', 'yashodha', NULL, 0, '', '2022-09-28 19:36:08.026585', '2022-09-28 19:36:08.026585', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('70e67b8afba48c915a', 'nasir', NULL, 0, '', '2022-09-29 13:18:22.688069', '2022-09-29 13:18:22.688069', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('323b7b98c4ca9af294', 'sanjay satra', NULL, 0, '', '2022-09-29 13:32:48.820662', '2022-09-29 13:32:48.820662', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6f15e78ef4d356033a', 'prakash ji', NULL, 0, '', '2022-09-29 13:53:29.983097', '2022-09-29 13:53:29.983097', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dbaf9bca347f4a2377', 'karthik mandal', '9834337118', 0, '', '2022-09-29 15:22:19.127484', '2022-09-29 15:22:19.127484', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32b0230326a51d55f8', 'probhir', NULL, 0, '', '2022-09-29 15:38:40.230477', '2022-09-29 15:38:40.230477', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('79e0a42596c56856a8', 'sapan dey', '8250617735', 0, '', '2022-09-29 16:37:51.785834', '2022-09-29 16:37:51.785834', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62ae67671bfa152b02', 'kabir', NULL, 0, '', '2022-09-29 18:02:59.722996', '2022-09-29 18:02:59.722996', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d42f6f46ada527337', 'N K', NULL, 0, '', '2022-09-29 20:56:39.354502', '2022-09-29 20:56:39.354502', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1fe13e6dc3439c4ee8', 'chandu', NULL, 0, '', '2022-09-30 10:00:28.951374', '2022-09-30 10:00:28.951374', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a867b2db0005b497ba', 'feroz', NULL, 0, '', '2022-09-30 12:13:20.668901', '2022-09-30 12:13:20.668901', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('df93f7701948c93861', 'PINTU GOSH', '6291319823', 0, '', '2022-09-30 17:47:47.483007', '2022-09-30 17:47:47.483007', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1377e4f42b02d81eb8', 'abhas', NULL, 0, '', '2022-09-30 19:52:28.171765', '2022-09-30 19:52:28.171765', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b8405e9d082597c9f6', 'manna  shri jewels', NULL, 0, '', '2022-09-30 20:31:32.542740', '2022-09-30 20:31:32.542740', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('607aa6d309e378d2e2', 'shabir ali', NULL, 0, '', '2022-10-01 11:27:11.251619', '2022-10-01 11:27:11.251619', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2b93ae1c7d861ac8cd', 'prashanth ghodai', NULL, 0, '', '2022-10-01 11:32:24.363343', '2022-10-01 11:32:24.363343', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('018f570758f50fec24', 'S NARANDER', NULL, 0, '', '2022-10-01 12:03:12.740690', '2022-10-01 12:03:12.740690', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('da7c23e7fbc02f9d5d', 'Ratnadeep pradhan', '7384448756', 0, '', '2022-10-01 12:53:12.037697', '2022-10-01 12:53:12.037697', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8fa3874ca917856373', 'SHAMSHUDIN', NULL, 0, '', '2022-10-01 13:09:59.100586', '2022-10-01 13:09:59.100586', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c93caf0d114ebd2f43', 'ALI DA', NULL, 0, '', '2022-10-01 13:14:35.277135', '2022-10-01 13:14:35.277135', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b2c54695033ada2cc3', 'KARTHIK MAJONDAR', NULL, 0, '', '2022-10-01 13:51:05.686263', '2022-10-01 13:51:05.686263', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a4e604cc820c10fbfa', 'SUNIL KOTAR', NULL, 0, '', '2022-10-01 13:54:38.277274', '2022-10-01 13:54:38.277274', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7dfe3bb4b5f3a703f6', 'SUNIL KOTARI', NULL, 0, '', '2022-10-01 13:54:50.028913', '2022-10-01 13:54:50.028913', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d50f5598e1cd90b7be', 'BALARAM', NULL, 0, '', '2022-10-01 14:05:48.012567', '2022-10-01 14:05:48.012567', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d987d2f80406ded18c', 'manjunath', NULL, 0, '', '2022-10-01 15:32:54.888183', '2022-10-01 15:32:54.888183', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('25993325a4996d98d4', 'mammud', NULL, 0, '', '2022-10-01 15:47:39.863438', '2022-10-01 15:47:39.863438', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4ae4b116d472fea8cf', 'murali anna', NULL, 0, '', '2022-10-01 19:09:30.630621', '2022-10-01 19:09:30.630621', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1761013778dd484114', 'R.m jewellers', NULL, 0, '', '2022-10-01 21:14:49.107396', '2022-10-01 21:14:49.107396', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62534219b77ae42330', 'murali', NULL, 0, '', '2022-10-03 10:52:01.796602', '2022-10-03 10:52:01.796602', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ecb101198677888bc4', 'debu s', NULL, 0, '', '2022-10-03 12:57:11.339630', '2022-10-03 12:57:11.339630', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f276c9a9b49b85fa35', 'nakul sarkar', NULL, 0, '', '2022-10-03 13:18:29.260274', '2022-10-03 13:18:29.260274', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ba99433509567379cb', 'kallipadu rong', NULL, 0, '', '2022-10-03 13:21:39.947160', '2022-10-03 13:21:39.947160', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('571a8b6751e278f8f7', 'madhan', NULL, 0, '', '2022-10-03 13:29:36.837856', '2022-10-03 13:29:36.837856', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('18871c55ecf7f777cd', 'dilip hait', NULL, 0, '', '2022-10-03 16:11:45.433371', '2022-10-03 16:11:45.433371', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d939c736754ef4179f', 'biswajeet santra', NULL, 0, '', '2022-10-03 16:21:20.594970', '2022-10-03 16:21:20.594970', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e072e0203c1f13d382', 'swaroop', NULL, 0, '', '2022-10-03 17:11:48.637437', '2022-10-03 17:11:48.637437', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b131e81d6974e0ee5b', 'amol dulai', '8217383504', 0, '', '2022-10-03 19:07:43.267954', '2022-10-03 19:07:43.267954', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ca7ea2a2862579ba5', 'muzafar', NULL, 0, '', '2022-10-03 20:42:18.528757', '2022-10-03 20:42:18.528757', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8609845ce856435375', 'rinku', NULL, 0, '', '2022-10-04 13:53:48.718067', '2022-10-04 13:53:48.718067', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('65cc1aaea1d19e24c6', 'reeku', NULL, 0, '', '2022-10-04 14:08:13.877595', '2022-10-04 14:08:13.877595', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('db1da16da8ebe387bc', 'govindo', NULL, 0, '', '2022-10-04 14:39:46.654993', '2022-10-04 14:39:46.654993', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('570897b96278430f2f', 'jahangir', NULL, 0, '', '2022-10-04 14:44:55.224543', '2022-10-04 14:44:55.224543', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('198f20f9f07862cba4', 'ripon', NULL, 0, '', '2022-10-05 13:03:55.504502', '2022-10-05 13:03:55.504502', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a906ff3ff3ff8524c9', 'mahaveer', NULL, 0, '', '2022-10-05 13:50:00.986203', '2022-10-05 13:50:00.986203', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8651c15fdf25ef02e0', 'vikram maithye', '9353457921', 0, '', '2022-10-05 14:48:24.942146', '2022-10-05 14:48:24.942146', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('68dca371e296e9102f', 'sanu satra', '8618826891', 0, '', '2022-10-05 16:31:11.819601', '2022-10-05 16:31:11.819601', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a25765ad2fac342a9f', 'muddassir(almaz)', NULL, 0, '', '2022-10-05 16:34:23.339114', '2022-10-05 16:34:23.339114', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b1cdfed62eebe9485e', 'velu', NULL, 0, '', '2022-10-05 17:34:38.720232', '2022-10-05 17:34:38.720232', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cdcc6743f7ad7c2990', 'radha govindo', NULL, 0, '', '2022-10-05 19:35:40.255083', '2022-10-05 19:35:40.255083', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cb78afb99958023556', 'b s p', NULL, 0, '', '2022-10-06 11:07:14.526708', '2022-10-06 11:07:14.526708', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fee38129804bfd200f', 'mahipal', NULL, 0, '', '2022-10-06 13:30:13.884578', '2022-10-06 13:30:13.884578', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('59d437f566887ab42e', 'shanti', NULL, 0, '', '2022-10-06 13:31:30.037868', '2022-10-06 13:31:30.037868', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ead4c483c28aac09b4', 'sourabh', NULL, 30, '', '2022-10-06 19:02:17.497057', '2022-10-06 19:02:17.497057', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d774601ebc04b01334', 'lakshmi', NULL, 0, '', '2022-10-06 19:22:44.707099', '2022-10-06 19:22:44.707099', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e31e58cd8d1bc59b54', 'astik', NULL, 0, '', '2022-10-06 20:15:01.664925', '2022-10-06 20:15:01.664925', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f21cd93a157b452557', 'robi shah', '9036284088', 0, '', '2022-10-07 10:47:25.525941', '2022-10-07 10:47:25.525941', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('145b074ab959d8c7ca', 'ranjan mondal', '9945804377', 0, '', '2022-10-07 12:13:04.578923', '2022-10-07 12:13:04.578923', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('02a079458024598f58', 'pragya', NULL, 0, '', '2022-10-07 16:19:29.752326', '2022-10-07 16:19:29.752326', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a7d9d82c47e1c1edcd', 'arshad', NULL, 0, '', '2022-10-07 16:21:06.675077', '2022-10-07 16:21:06.675077', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a543feb8a9b276e456', 'nagraj', NULL, 0, '', '2022-10-07 16:26:27.271635', '2022-10-07 16:26:27.271635', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e6dcee1f2df90a1f7a', 's j m', NULL, 0, '', '2022-10-07 21:16:47.654003', '2022-10-07 21:16:47.654003', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a4daf60a23eb35a494', 'basu', NULL, 0, '', '2022-10-07 21:18:22.047894', '2022-10-07 21:18:22.047894', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('14371403ad5afcf06c', 'anand sheik', '8050802057', 0, '', '2022-10-08 11:09:04.697174', '2022-10-08 11:09:04.697174', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8fedca3185619164db', 'shilpa kala', NULL, 0, '', '2022-10-08 11:59:09.918358', '2022-10-08 11:59:09.918358', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4944a18cc0f2b75502', 's n', NULL, 0, '', '2022-10-08 12:00:32.404172', '2022-10-08 12:00:32.404172', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d4e310a371485a8ae', 'chiranjeet mondal', '7975953353', 0, '', '2022-10-08 12:38:39.984839', '2022-10-08 12:38:39.984839', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5296e0e5c71ba228ed', 'manashree', NULL, 0, '', '2022-10-08 13:00:13.726894', '2022-10-08 13:00:13.726894', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('53b2a75c4902a2cf23', 'sanjay khan', NULL, 0, '', '2022-10-08 17:45:33.399338', '2022-10-08 17:45:33.399338', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('822b14dd4ad9b6242f', 's k sampath', NULL, 0, '', '2022-10-08 19:03:00.889296', '2022-10-08 19:03:00.889296', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d9cd60e72d86e570e5', 'sow nagadeephi', NULL, 0, '', '2022-10-08 20:42:52.190105', '2022-10-08 20:42:52.190105', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('967d192cf3db24adf5', 'tushar bera', '7899441812', 30, '', '2022-10-08 21:40:26.537978', '2022-10-08 21:40:26.537978', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4a059c58b29c13bf9f', 'sukantho', NULL, 0, '', '2022-10-09 11:28:58.244835', '2022-10-09 11:28:58.244835', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4d13a7edf71c57a396', 'deb kumar', '8951439877', 0, '', '2022-10-09 12:46:26.271168', '2022-10-09 12:46:26.271168', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9be09622a2ea93473e', 'abhijeet maithi', NULL, 0, '', '2022-10-10 19:34:30.961120', '2022-10-10 19:34:30.961120', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8ede44bff32a696cdd', 'anmol j', NULL, 0, '', '2022-10-11 11:36:48.582169', '2022-10-11 11:36:48.582169', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('225f02961b02c1a16a', 's k sharif', NULL, 0, '', '2022-10-11 12:08:37.288334', '2022-10-11 12:08:37.288334', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c5954ef3062e7d8098', 'just silver', NULL, 0, '', '2022-10-11 16:22:39.952771', '2022-10-11 16:22:39.952771', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1f8a99e74519138426', 'shivshankar', NULL, 0, '', '2022-10-11 17:08:29.376547', '2022-10-11 17:08:29.376547', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9fa7df74a1405a562c', 'sajid ali', NULL, 0, '', '2022-10-11 19:07:04.739657', '2022-10-11 19:07:04.739657', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6af3e9c4cda12151ef', 'arup maji', NULL, 0, '', '2022-10-12 11:00:30.775670', '2022-10-12 11:00:30.775670', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('acc93e10617ba5c023', 'S B', NULL, 0, '', '2022-10-12 13:06:01.424372', '2022-10-12 13:06:01.424372', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c401e7b7e1f1b9f5c3', 'sukur ali', NULL, 0, '', '2022-10-13 10:15:00.793113', '2022-10-13 10:15:00.793113', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b9574050142c8246a4', 'subendu', NULL, 0, '', '2022-10-13 15:59:39.911235', '2022-10-13 15:59:39.911235', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e0e831ab4d3f55b414', 'anand sheet', NULL, 0, '', '2022-10-13 18:11:15.192728', '2022-10-13 18:11:15.192728', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d9edbb8d4856a932d5', 'vikas', NULL, 0, '', '2022-10-13 19:07:39.716082', '2022-10-13 19:07:39.716082', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6bab047967ba044f56', 's  s', NULL, 0, '', '2022-10-13 20:44:10.611981', '2022-10-13 20:44:10.611981', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3ba0674f0e0d60b90e', 'sushanth dey', NULL, 0, '', '2022-10-14 11:12:57.368013', '2022-10-14 11:12:57.368013', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('232555a92c9bb51b62', 'ripan', NULL, 0, '', '2022-10-14 11:16:55.009683', '2022-10-14 11:16:55.009683', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('06fcd711bc6e64f2c1', 'anup maithi', NULL, 0, '', '2022-10-14 12:32:27.277127', '2022-10-14 12:32:27.277127', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dc9d95116689882e6b', 'gopal mestri', NULL, 0, '', '2022-10-14 13:05:18.140456', '2022-10-14 13:05:18.140456', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('886e22bde7b0388f80', 'khan', NULL, 0, '', '2022-10-14 19:12:12.604081', '2022-10-14 19:12:12.604081', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d489fecb4673aa768a', 'manav', NULL, 0, '', '2022-10-14 20:00:12.609669', '2022-10-14 20:00:12.609669', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2f4bfe600a5e7f6709', 'abhi das', NULL, 0, '', '2022-10-14 21:10:12.883355', '2022-10-14 21:10:12.883355', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b2fdaa967b176c75e5', 'debnath chakravathy', '7795936450', 0, '', '2022-10-15 12:12:20.486855', '2022-10-15 12:12:20.486855', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a72752394911d96863', 'sumith guchait', '9901580825', 0, '', '2022-10-15 12:26:50.742433', '2022-10-15 12:26:50.742433', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3f2c0132058bf01c0b', 'nandan maithye', '8918057336', 0, '', '2022-10-15 12:54:14.874171', '2022-10-15 12:54:14.874171', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9f70391c3ab6874b18', 'sufal', NULL, 0, '', '2022-10-15 14:32:40.264771', '2022-10-15 14:32:40.264771', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('da17dc031c58442932', 'biman sawanth', '9036103307', 0, '', '2022-10-15 17:30:01.765970', '2022-10-15 17:30:01.765970', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6ddcc7ee6d7bd88333', 'sahil', NULL, 0, '', '2022-10-15 18:37:57.932525', '2022-10-15 18:37:57.932525', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6ff73d4a52acdb54f5', 'mujaffar', NULL, 0, '', '2022-10-16 12:10:13.357766', '2022-10-16 12:10:13.357766', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c1ccfe5c2740ade10c', 'shyam sundar', NULL, 0, '', '2022-10-16 14:06:11.384438', '2022-10-16 14:06:11.384438', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3a4a6bb3cdb6953bdc', 'nirama', NULL, 0, '', '2022-10-17 10:21:22.207764', '2022-10-17 10:21:22.207764', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('59e0c08e36135810b9', 'rudra', NULL, 0, '', '2022-10-17 11:51:43.759196', '2022-10-17 11:51:43.759196', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('61d90daaef7b1b3d74', 'm j r', NULL, 0, '', '2022-10-17 11:54:44.454959', '2022-10-17 11:54:44.454959', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('512095cb71854f9e84', 'jantu', NULL, 0, '', '2022-10-17 12:33:38.298332', '2022-10-17 12:33:38.298332', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('030e1456449b844434', 'ranjeet sarkar', NULL, 0, '', '2022-10-17 12:40:15.909572', '2022-10-17 12:40:15.909572', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3a35938637f2617620', 'r p s jewels', NULL, 0, '', '2022-10-17 12:50:53.570072', '2022-10-17 12:50:53.570072', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e916bab553919927c1', 'sudarashan malik', NULL, 0, '', '2022-10-17 14:58:44.860860', '2022-10-17 14:58:44.860860', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a50245701a5e1d4a6f', 'arvind', NULL, 0, '', '2022-10-17 15:54:55.126838', '2022-10-17 15:54:55.126838', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c9bb488a94967405a2', 'prashanth gosh', NULL, 0, '', '2022-10-17 17:10:26.366129', '2022-10-17 17:10:26.366129', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c3e853d496a6788e4', 'amith paja', NULL, 0, '', '2022-10-17 20:34:38.673370', '2022-10-17 20:34:38.673370', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c4b7583ce2a5745f3d', 'probhas', NULL, 0, '', '2022-10-18 10:38:12.933209', '2022-10-18 10:38:12.933209', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c725e65d9da6b2c59d', 'sukhen', NULL, 0, '', '2022-10-18 10:42:03.128110', '2022-10-18 10:42:03.128110', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('24b1618b5d4fd7b5e2', 'mr.m.k raama', NULL, 0, '', '2022-10-18 12:30:47.619314', '2022-10-18 12:30:47.619314', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('292a3781105e40afdc', 'dilip', NULL, 0, '', '2022-10-18 14:04:51.704935', '2022-10-18 14:04:51.704935', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e1e449f102aa167765', 'surjeet mondal', NULL, 0, '', '2022-10-18 16:00:35.220072', '2022-10-18 16:00:35.220072', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('040a7d61d48d9b9294', 'padhyuth', NULL, 0, '', '2022-10-18 16:09:14.918360', '2022-10-18 16:09:14.918360', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d7e3032b845c00067c', 'laxmi jewels', NULL, 0, '', '2022-10-18 17:17:22.004275', '2022-10-18 17:17:22.004275', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fcc569f74f14bb4e1a', 'n k jain', NULL, 0, '', '2022-10-18 17:54:32.995399', '2022-10-18 17:54:32.995399', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('656f9d84b72e631443', 'sajal mondal', NULL, 0, '', '2022-10-18 19:40:02.506210', '2022-10-18 19:40:02.506210', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8b4187c9fa05c1d160', 'tapu', NULL, 0, '', '2022-10-19 11:53:32.154083', '2022-10-19 11:53:32.154083', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('75038548a5db3a026d', 'disha', NULL, 0, '', '2022-10-19 12:00:12.523381', '2022-10-19 12:00:12.523381', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6650934087d5d9d6c5', 'ranjan', NULL, 0, '', '2022-10-19 13:30:36.268657', '2022-10-19 13:30:36.268657', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('86acce4120d6fae300', 'sisir maithi', NULL, 0, '', '2022-10-19 16:17:44.645946', '2022-10-19 16:17:44.645946', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('780ad572873238ab45', 'akash bera', '7908469557', 0, '', '2022-10-19 19:29:25.693638', '2022-10-19 19:29:25.693638', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c6fb91a70180285bde', 'RAM PATRA', NULL, 0, '', '2022-10-19 20:48:44.065722', '2022-10-19 20:48:44.065722', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a16274e2fb5afbb197', 'ali bomik', '9113931445', 0, '', '2022-10-20 12:23:50.124826', '2022-10-20 12:23:50.124826', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f44e5111dd0c36bfdc', 'biplab', NULL, 0, '', '2022-10-20 13:14:13.767044', '2022-10-20 13:14:13.767044', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('07beaafd740255a2b6', 'ganesh manna', NULL, 0, '', '2022-10-20 15:11:41.141101', '2022-10-20 15:11:41.141101', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9b0c87dcff50f59844', 'suresh', NULL, 0, '', '2022-10-20 17:58:23.620909', '2022-10-20 17:58:23.620909', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e89f0b980f464f2e4d', 'maithi', NULL, 0, '', '2022-10-20 18:30:16.693559', '2022-10-20 18:30:16.693559', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fabf174410bc3a6334', 'r j', NULL, 0, '', '2022-10-21 10:19:32.985988', '2022-10-21 10:19:32.985988', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1a480f91bec68b3c9b', 'kinkar', NULL, 0, '', '2022-10-21 14:18:07.205112', '2022-10-21 14:18:07.205112', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('25473f1d51bbfedc58', 'mahalaxmi jewels', NULL, 0, '', '2022-10-21 16:39:24.145433', '2022-10-21 16:39:24.145433', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bcd2bbaec5abca58a7', 'jai kishan', NULL, 0, '', '2022-10-21 18:11:12.002040', '2022-10-21 18:11:12.002040', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f5dd82c35d86da889d', 'qutub', NULL, 0, '', '2022-10-21 18:15:01.887097', '2022-10-21 18:15:01.887097', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('25d3dd81e38db53257', 'pratap', NULL, 0, '', '2022-10-21 18:24:56.367067', '2022-10-21 18:24:56.367067', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('754853cdf800568c8b', 'r m jewels', NULL, 0, '', '2022-10-21 19:49:56.343427', '2022-10-21 19:49:56.343427', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('57e290060b2ae7c6ed', 'abhijeet jana', NULL, 0, '', '2022-10-21 21:29:10.941995', '2022-10-21 21:29:10.941995', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e8569fd7f3889c3cca', 'sheik manzur alam', NULL, 0, '', '2022-10-22 12:52:09.666186', '2022-10-22 12:52:09.666186', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('55839bfd100279250a', 'praveen', NULL, 0, '', '2022-10-22 14:54:27.946658', '2022-10-22 14:54:27.946658', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('29da1a8524123a26d0', 'b r l', NULL, 0, '', '2022-10-22 16:04:57.661329', '2022-10-22 16:04:57.661329', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('12ccccba4526457a1d', 'dhyan', NULL, 0, '', '2022-10-22 16:34:57.805202', '2022-10-22 16:34:57.805202', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4923a73054011fc5ef', 'goutham sar', NULL, 0, '', '2022-10-22 16:35:46.185767', '2022-10-22 16:35:46.185767', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('032b78c8f835c49e30', 'radika reddy', NULL, 0, '', '2022-10-22 17:05:38.807032', '2022-10-22 17:05:38.807032', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('db54879c6c2cec63bd', 'jaidev', NULL, 0, '', '2022-10-22 17:53:22.448582', '2022-10-22 17:53:22.448582', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2f1669205914f8bb1b', 'shabhan', NULL, 0, '', '2022-10-22 18:32:47.000453', '2022-10-22 18:32:47.000453', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('950dafb78162de425c', 'prabhir', NULL, 0, '', '2022-10-22 19:43:06.382539', '2022-10-22 19:43:06.382539', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b2c8caa0e777731d6e', 'manyashree jewels', NULL, 0, '', '2022-10-23 14:26:59.995957', '2022-10-23 14:26:59.995957', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7e7369eb4f6328eee4', 'meghnath', NULL, 30, '', '2022-10-24 10:28:15.530691', '2022-10-24 10:28:15.530691', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('58883710848d3608e0', 'shibu', NULL, 0, '', '2022-10-24 13:27:37.169809', '2022-10-24 13:27:37.169809', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1e7446693b6f6f936a', 'madhu', NULL, 0, '', '2022-10-24 13:52:42.265969', '2022-10-24 13:52:42.265969', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b80a4c55ade9f86e97', 'devraj', NULL, 0, '', '2022-10-24 15:56:59.388935', '2022-10-24 15:56:59.388935', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b2b2a2e40b7caf9c55', 'samuel sawanth', NULL, 0, '', '2022-10-26 10:23:04.971236', '2022-10-26 10:23:04.971236', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4e48c983d66dfa571c', 'yousuf', NULL, 0, '', '2022-10-26 11:09:20.790585', '2022-10-26 11:09:20.790585', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('82caf63e4da3f2a30e', 'sk naren', NULL, 0, '', '2022-10-26 12:01:52.625363', '2022-10-26 12:01:52.625363', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0d8b4d37a26b786a92', 'sudeep balu', NULL, 0, '', '2022-10-26 13:02:41.977968', '2022-10-26 13:02:41.977968', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d801a80f95959b121', 'goutham bhera', NULL, 0, '', '2022-10-26 13:14:28.066796', '2022-10-26 13:14:28.066796', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c76a845c5aa60df6a7', 'uday', NULL, 0, '', '2022-10-26 13:17:14.537707', '2022-10-26 13:17:14.537707', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dcb373257c128ab1a4', 'alam', NULL, 0, '', '2022-10-26 13:26:09.883747', '2022-10-26 13:26:09.883747', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('563da3f504cc923853', 'swarup', NULL, 0, '', '2022-10-26 13:54:33.038594', '2022-10-26 13:54:33.038594', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ad94134188fc904d11', 'debu bera', NULL, 0, '', '2022-10-26 14:11:53.198682', '2022-10-26 14:11:53.198682', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1a87c1f229310be04d', 'ganesh', NULL, 0, '', '2022-10-26 14:23:06.873021', '2022-10-26 14:23:06.873021', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f56bc8773bf591b56a', 'shyam manna', '9019742717', 0, '', '2022-10-26 14:47:27.960544', '2022-10-26 14:47:27.960544', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7a219d867bb13e74c2', 'sanathan', NULL, 0, '', '2022-10-26 18:54:11.639100', '2022-10-26 18:54:11.639100', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d0f8e9ecf6667812c3', 'zain', NULL, 0, '', '2022-10-26 19:38:28.478016', '2022-10-26 19:38:28.478016', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d51e6a0bc1bf78770d', 'latif', NULL, 0, '', '2022-10-27 12:23:49.407291', '2022-10-27 12:23:49.407291', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fdf97157da0f78ccdc', 'sujay manik', NULL, 0, '', '2022-10-27 14:43:01.453675', '2022-10-27 14:43:01.453675', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('36f65e8e27db4d7d91', 'raju das', NULL, 0, '', '2022-10-27 17:58:55.316715', '2022-10-27 17:58:55.316715', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d0df2b961e3168bc60', 'sapan das', NULL, 0, '', '2022-10-28 10:56:17.010332', '2022-10-28 10:56:17.010332', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3759a908a2bfb3447e', 'suman dhara', NULL, 0, '', '2022-10-28 11:14:25.184778', '2022-10-28 11:14:25.184778', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f651258cdfa1b24655', 'debashish bag', NULL, 0, '', '2022-10-28 12:13:15.197988', '2022-10-28 12:13:15.197988', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f2c6f1307a5b00e1b7', 's l j', NULL, 0, '', '2022-10-28 14:27:52.642248', '2022-10-28 14:27:52.642248', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b69798e553f5de721d', 'b s puttaya', NULL, 0, '', '2022-10-28 16:17:34.310938', '2022-10-28 16:17:34.310938', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('23f45ed36a553dc518', 'r r gold', NULL, 0, '', '2022-10-28 16:33:33.525793', '2022-10-28 16:33:33.525793', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a15fe51630817b8bda', 'banku', NULL, 0, '', '2022-10-28 17:13:20.520630', '2022-10-28 17:13:20.520630', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f847ea303774f01fe6', 'santu ghuyia', NULL, 0, '', '2022-10-28 18:20:59.410084', '2022-10-28 18:20:59.410084', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f44ed3edb0567f8b9a', 'sisir', NULL, 0, '', '2022-10-28 20:58:49.187766', '2022-10-28 20:58:49.187766', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7d5984da96b127b31c', 'shyamal maity', NULL, 0, '', '2022-10-29 11:31:16.524643', '2022-10-29 11:31:16.524643', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('59c8b1038132b7d5cf', 'jain', NULL, 60, '', '2022-10-29 13:34:54.084898', '2022-10-29 13:34:54.084898', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9a1eb3d0437ee1323b', 'ravi kumar hp', NULL, 0, '', '2022-10-29 17:03:54.648793', '2022-10-29 17:03:54.648793', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c65caeded8f45e0098', 'akthar', NULL, 0, '', '2022-10-29 18:40:32.927645', '2022-10-29 18:40:32.927645', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fc2dbd85e376fa2741', 'SUSHIL MANNA', NULL, 0, '', '2022-10-29 18:48:55.796886', '2022-10-29 18:48:55.796886', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ffeb0f7dee21f1dfae', 'pradeep mandal', NULL, 0, '', '2022-10-29 20:52:21.073326', '2022-10-29 20:52:21.073326', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d5deb33021b922ad2', 'samuel debnath', NULL, 0, '', '2022-10-30 12:46:02.819607', '2022-10-30 12:46:02.819607', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9eed4ea2a01b15913a', 'uttam adak', NULL, 0, '', '2022-10-31 11:17:46.543876', '2022-10-31 11:17:46.543876', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b7b96c0ab024aeef2d', 'vijay sawantho', NULL, 0, '', '2022-10-31 12:10:46.160816', '2022-10-31 12:10:46.160816', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('044919574a36e7e0ba', 'anando shet', NULL, 0, '', '2022-10-31 12:23:06.799759', '2022-10-31 12:23:06.799759', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e6a4c991d375999708', 'polash pramanik', NULL, 0, '', '2022-10-31 15:31:18.910746', '2022-10-31 15:31:18.910746', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b18f293a4cd3e3d8a1', 'suphal', NULL, 0, '', '2022-10-31 16:00:01.015845', '2022-10-31 16:00:01.015845', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('482690e349d48164e4', 'pinku', NULL, 0, '', '2022-10-31 18:45:16.040308', '2022-10-31 18:45:16.040308', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('df356caaf2289388a1', 'ramesh maithi', NULL, 0, '', '2022-10-31 20:41:13.156401', '2022-10-31 20:41:13.156401', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('de3307cef27c4296e6', 'chittu', NULL, 0, '', '2022-11-01 11:12:21.934560', '2022-11-01 11:12:21.934560', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60dc69cd2afba7ad1a', 'abhi da', NULL, 0, '', '2022-11-01 14:40:59.683534', '2022-11-01 14:40:59.683534', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f6db5d530c7667aa61', 'vikram sawantho', NULL, 0, '', '2022-11-01 17:06:09.280340', '2022-11-01 17:06:09.280340', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('de0ee73434dd841105', 'raju mondal', NULL, 0, '', '2022-11-01 19:01:42.046569', '2022-11-01 19:01:42.046569', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('217622f60b08f845f9', 'gopi gi', NULL, 0, '', '2022-11-01 21:01:30.380606', '2022-11-01 21:01:30.380606', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7fd34c158fb01b7b80', 'bhagvan singh', NULL, 0, '', '2022-11-02 10:26:27.799396', '2022-11-02 10:26:27.799396', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b84fa68c4ed40157de', 'appurva', NULL, 0, '', '2022-11-02 11:17:06.742408', '2022-11-02 11:17:06.742408', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('be19d0c4580c5a6929', 'jalanadar', NULL, 0, '', '2022-11-02 12:54:52.942647', '2022-11-02 12:54:52.942647', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ff88c8bebbf94d8f61', 'harish', NULL, 0, '', '2022-11-02 13:32:25.342611', '2022-11-02 13:32:25.342611', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('be545b9055743c91b6', 'mortaza', NULL, 0, '', '2022-11-02 15:01:53.814310', '2022-11-02 15:01:53.814310', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e008749fe9639689c6', 'subana', NULL, 0, '', '2022-11-02 15:41:35.042142', '2022-11-02 15:41:35.042142', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('193c69eb599e8d8de0', 'chiranjeet panja set', '9986316393', 0, '', '2022-11-02 16:57:27.114555', '2022-11-02 16:57:27.114555', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8540d97ddfb6b18bce', 'mamud', NULL, 0, '', '2022-11-02 17:44:08.558501', '2022-11-02 17:44:08.558501', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('13be254ecae5fb1f06', 's.k asghar', NULL, 0, '', '2022-11-02 19:52:04.800996', '2022-11-02 19:52:04.800996', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('93c77279452436cf21', 'subhojeet', NULL, 0, '', '2022-11-02 21:12:21.583541', '2022-11-02 21:12:21.583541', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('09e5166e7652bd3258', 'shubhash das', NULL, 0, '', '2022-11-03 14:05:03.568814', '2022-11-03 14:05:03.568814', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f389d5605928e238cc', 'roni', NULL, 0, '', '2022-11-03 15:00:57.168021', '2022-11-03 15:00:57.168021', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2f4e13b0eb06371a95', 'amal maithye', '7204634430', 0, '', '2022-11-03 16:58:58.103573', '2022-11-03 16:58:58.103573', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fb264701534720ad3e', 'nebi', NULL, 0, '', '2022-11-03 17:04:35.296296', '2022-11-03 17:04:35.296296', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0718e339da933dfe7a', 'dharshan', NULL, 0, '', '2022-11-03 18:52:17.744606', '2022-11-03 18:52:17.744606', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8a395088a5dcec8302', 'mank bhai', NULL, 0, '', '2022-11-03 19:03:17.545065', '2022-11-03 19:03:17.545065', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('af92653b3568ac704e', 'shanu', NULL, 0, '', '2022-11-03 21:03:11.347435', '2022-11-03 21:03:11.347435', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8fddfc4a3c681f3960', 'uttam devnath', '9620925916', 0, '', '2022-11-04 11:38:55.808711', '2022-11-04 11:38:55.808711', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('da337af5adab23a3f1', 'radhika reddy', NULL, 0, '', '2022-11-04 14:49:10.192578', '2022-11-04 14:49:10.192578', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c8be6ec05d394c3578', 'gourang', NULL, 0, '', '2022-11-04 15:01:10.212270', '2022-11-04 15:01:10.212270', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f3e0c824abe76618ea', 'gopal sharma', NULL, 90, '', '2022-11-04 15:54:40.360771', '2022-11-04 15:54:40.360771', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aadd08ca3e2b635291', 'gokul jewels', NULL, 0, '', '2022-11-04 17:02:05.619859', '2022-11-04 17:02:05.619859', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('74c8f1a2023232c344', 'brundhavanam j', NULL, 0, '', '2022-11-04 17:29:53.255975', '2022-11-04 17:29:53.255975', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('024be188ea843999a8', 'azhar', NULL, 0, '', '2022-11-04 20:18:10.921643', '2022-11-04 20:18:10.921643', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3255d7705ac16934ef', 'sheikh akbar ali', NULL, 0, '', '2022-11-05 10:41:03.321861', '2022-11-05 10:41:03.321861', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fbdfd328200312ea7f', 'k p j', NULL, 0, '', '2022-11-05 13:05:21.902563', '2022-11-05 13:05:21.902563', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c980dc7f5a65f50011', 'dilesh', NULL, 0, '', '2022-11-05 14:57:44.615324', '2022-11-05 14:57:44.615324', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5188553ff8de8e6ee6', 'b s nagaraja', NULL, 0, '', '2022-11-05 16:29:11.317309', '2022-11-05 16:29:11.317309', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7622bc18ae88887c69', 'gourang dey', NULL, 0, '', '2022-11-05 17:07:30.493951', '2022-11-05 17:07:30.493951', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3d7320626fba0ce400', 'boliye sharma', NULL, 0, '', '2022-11-05 18:15:30.226695', '2022-11-05 18:15:30.226695', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8b92c45919c71eccbd', 'uttham dey', NULL, 0, '', '2022-11-05 19:12:06.073120', '2022-11-05 19:12:06.073120', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('523fe127cc5a985985', 'bappa das', '8095428299', 0, '', '2022-11-05 21:18:39.581462', '2022-11-05 21:18:39.581462', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37e871104b7de22533', 'madan das', '7892016507', 0, '', '2022-11-06 14:26:00.534936', '2022-11-06 14:26:00.534936', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d7366a5648c7a4679d', 'laltu bomik', '9742146839', 0, '', '2022-11-07 10:52:45.701916', '2022-11-07 10:52:45.701916', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a8421c654313630be0', 'simanthu', NULL, 0, '', '2022-11-07 12:42:06.847515', '2022-11-07 12:42:06.847515', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d2bdbd70f8986e73e', 'aparesh', NULL, 0, '', '2022-11-07 12:55:26.698282', '2022-11-07 12:55:26.698282', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f86e318074326f5379', 'chitra', NULL, 0, '', '2022-11-07 15:20:27.074712', '2022-11-07 15:20:27.074712', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e57bd19a0fe47b7089', 'usha', NULL, 50, '', '2022-11-07 15:28:50.727584', '2022-11-07 15:28:50.727584', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c35a0bbaf245be3f05', 'v h jewels', NULL, 0, '', '2022-11-07 16:56:05.670551', '2022-11-07 16:56:05.670551', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3d53a6d595fc38f6be', 'mahanatu', NULL, 0, '', '2022-11-07 17:00:59.894772', '2022-11-07 17:00:59.894772', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b7a62549a5efdd9b1e', 'montu khan', NULL, 0, '', '2022-11-07 20:39:31.699748', '2022-11-07 20:39:31.699748', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aeaf88bf30db65bae4', 'n s', NULL, 0, '', '2022-11-07 21:41:22.620398', '2022-11-07 21:41:22.620398', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('46fedd2aa558f426ac', 'praveen santhanu', '9880099075', 0, '', '2022-11-08 12:25:45.874639', '2022-11-08 12:25:45.874639', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0b8710b52e191b1d05', 'mintu mojamdar', '8553792613', 0, '', '2022-11-08 13:41:30.691905', '2022-11-08 13:41:30.691905', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e36d3e562bbdcdd3dc', 'meghna', NULL, 0, '', '2022-11-08 16:08:50.001160', '2022-11-08 16:08:50.001160', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8426d4a4655d35031e', 's.k sharif', NULL, 0, '', '2022-11-08 17:20:26.341221', '2022-11-08 17:20:26.341221', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7d72fd32da255b967f', 'star', NULL, 0, '', '2022-11-08 18:19:15.662935', '2022-11-08 18:19:15.662935', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('be074e00e40dc81595', 'vh jewellers', NULL, 0, '', '2022-11-08 19:20:46.602624', '2022-11-08 19:20:46.602624', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cfc113da0074256340', 'surjeet bank', '8197145284', 0, '', '2022-11-08 20:33:23.434008', '2022-11-08 20:33:23.434008', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('373c375ef411f57e44', 'j v', NULL, 0, '', '2022-11-09 12:49:00.663050', '2022-11-09 12:49:00.663050', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('79b793edf92f919a96', 'navarathan j j', NULL, 0, '', '2022-11-09 13:24:07.439953', '2022-11-09 13:24:07.439953', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a97cdf322956cbdb20', 'dinesh mehta', NULL, 0, '', '2022-11-09 13:47:30.561441', '2022-11-09 13:47:30.561441', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('617f85d94c6a8f3207', 'babulaji', NULL, 0, '', '2022-11-09 14:20:05.522110', '2022-11-09 14:20:05.522110', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3a57136679f1a3225e', 'adil', NULL, 0, '', '2022-11-09 18:53:57.762480', '2022-11-09 18:53:57.762480', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('24fe25f8829b659457', 'm.s', NULL, 0, '', '2022-11-09 19:02:41.127617', '2022-11-09 19:02:41.127617', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('395ec1ce5625859a28', 'sumith', NULL, 0, '', '2022-11-09 19:30:36.041891', '2022-11-09 19:30:36.041891', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('538b5ff9026b20e52c', 'dhanraj', NULL, 0, '', '2022-11-09 20:53:15.669370', '2022-11-09 20:53:15.669370', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cfbebd6cfd2ea5bcbf', 'suman modi', NULL, 0, '', '2022-11-09 21:26:47.928108', '2022-11-09 21:26:47.928108', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bcfd64a535fe5592e3', 'rekha', NULL, 0, '', '2022-11-10 15:03:48.578358', '2022-11-10 15:03:48.578358', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('feaa6cfdb6abd62339', 'akash sow', '9740352122', 0, '', '2022-11-11 10:45:14.229553', '2022-11-11 10:45:14.229553', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dd46a1c3c0f6f03592', 'shantilal', NULL, 0, '', '2022-11-11 12:36:09.789965', '2022-11-11 12:36:09.789965', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e3833fc216d915913f', 'n j c', NULL, 0, '', '2022-11-11 17:12:20.899599', '2022-11-11 17:12:20.899599', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('64df62c119c7f5cb3c', 'N J JAYNAGAR', NULL, 30, '', '2022-11-11 20:04:10.122868', '2022-11-11 20:04:10.122868', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('02d931b3f4828a49cd', 'shivnath', NULL, 0, '', '2022-11-12 11:49:04.410986', '2022-11-12 11:49:04.410986', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eb71d58ad952ef58ef', 'j.p', NULL, 0, '', '2022-11-12 12:44:18.205089', '2022-11-12 12:44:18.205089', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bd979bff5dfce6aa7b', 'bilas', NULL, 0, '', '2022-11-12 13:36:46.912589', '2022-11-12 13:36:46.912589', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37052f9a9522cf7196', 'ansh', NULL, 0, '', '2022-11-12 19:31:25.545231', '2022-11-12 19:31:25.545231', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('01c76236cba665ec38', 'abhijeet bomik', NULL, 0, '', '2022-11-13 10:40:09.502272', '2022-11-13 10:40:09.502272', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('41cc9257b1b13f1d12', 'shanthi lal', NULL, 0, '', '2022-11-13 11:31:43.994877', '2022-11-13 11:31:43.994877', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bcea0e149dd548f6cd', 'utpal das', '8722594364', 0, '', '2022-11-13 12:20:00.365337', '2022-11-13 12:20:00.365337', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6dd72907fc0897bbc5', 'dhiraj', NULL, 0, '', '2022-11-13 12:46:22.115270', '2022-11-13 12:46:22.115270', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c9c12e2ba075cb1e0e', 's k saju', NULL, 0, '', '2022-11-13 14:21:48.795597', '2022-11-13 14:21:48.795597', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bd9f13c8911319016d', 'goutham mukharge', NULL, 0, '', '2022-11-14 10:46:54.021706', '2022-11-14 10:46:54.021706', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7ccd7bc6fe3ab4b8c9', 'suman gajar', '7871088392', 0, '', '2022-11-14 12:40:04.863058', '2022-11-14 12:40:04.863058', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a285b36f0cb303f3ec', 'karthik gyan', '7586831783', 0, '', '2022-11-14 12:45:17.583550', '2022-11-14 12:45:17.583550', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aaf664bd9f8723a06b', 'R S', NULL, 0, '', '2022-11-14 15:05:58.430180', '2022-11-14 15:05:58.430180', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4486287352d3f2f5b7', 'akshar', NULL, 0, '', '2022-11-14 15:44:41.034300', '2022-11-14 15:44:41.034300', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d8da468cffc114e209', 'chandhan manna', NULL, 0, '', '2022-11-14 17:00:07.875402', '2022-11-14 17:00:07.875402', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ebe82b26dfff47c5d2', 'bagirath', NULL, 30, '', '2022-11-14 17:10:48.542386', '2022-11-14 17:10:48.542386', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('12dc9d1399ace4225f', 'bablu porel', NULL, 0, '', '2022-11-14 18:53:37.413406', '2022-11-14 18:53:37.413406', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('19a6540bc17565df47', 'sms', NULL, 0, '', '2022-11-15 13:43:02.707907', '2022-11-15 13:43:02.707907', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('625b2cb6c68266926d', 'biswajeet pal', '7338165495', 0, '', '2022-11-15 14:27:18.755287', '2022-11-15 14:27:18.755287', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3910dd856430daaf4e', 'pramod', NULL, 0, '', '2022-11-15 14:46:53.436179', '2022-11-15 14:46:53.436179', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8aa94fa4d3498c59b9', 'mahadev jana', NULL, 0, '', '2022-11-15 14:55:41.449465', '2022-11-15 14:55:41.449465', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d4383adef2df67d227', 'bikas maithi', '7829928817', 0, '', '2022-11-15 16:01:15.615961', '2022-11-15 16:01:15.615961', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('28fc3021d5c541cec2', 'mohanthu bera', NULL, 0, '', '2022-11-15 16:14:36.993022', '2022-11-15 16:14:36.993022', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('10236b41b62d35c389', 'khayam', NULL, 0, '', '2022-11-15 16:28:59.839323', '2022-11-15 16:28:59.839323', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('415682ca31df27d0ea', 'ugham bhai', NULL, 0, '', '2022-11-15 17:05:10.578395', '2022-11-15 17:05:10.578395', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1ff59cc84fc48951b5', 'mahamud', NULL, 0, '', '2022-11-15 18:19:27.666219', '2022-11-15 18:19:27.666219', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1d19cdc4a6c63b29e0', 'bablu sardar', NULL, 0, '', '2022-11-16 12:05:16.527759', '2022-11-16 12:05:16.527759', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d4d97cacfca32635d1', 'banvari', NULL, 0, '', '2022-11-16 13:49:48.540746', '2022-11-16 13:49:48.540746', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4f010949c246038058', 'devo pote metya', NULL, 0, '', '2022-11-16 14:45:00.055268', '2022-11-16 14:45:00.055268', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c7beaf4312e22e22cd', 'anand raju', NULL, 0, '', '2022-11-16 15:29:57.266660', '2022-11-16 15:29:57.266660', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3a45f956e1df131e1c', 'sandeep sawantho', '8484360192', 0, '', '2022-11-16 18:54:05.637206', '2022-11-16 18:54:05.637206', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8b406d4efd49ff3f79', 'akbar ali', NULL, 0, '', '2022-11-16 21:16:42.329149', '2022-11-16 21:16:42.329149', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1100ea1b8594ee0492', 'binnet saw', NULL, 0, '', '2022-11-17 10:44:27.723614', '2022-11-17 10:44:27.723614', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('14fbde4a97c7391771', 'bharatha', NULL, 0, '', '2022-11-17 12:48:18.379150', '2022-11-17 12:48:18.379150', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('885dfe906d366fc2d0', 'dipayan', NULL, 0, '', '2022-11-17 13:01:03.035479', '2022-11-17 13:01:03.035479', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('10546cff62abc977f5', 'pachanan', NULL, 0, '', '2022-11-17 14:01:48.185769', '2022-11-17 14:01:48.185769', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0344df24a84520bd1d', 'v j e', NULL, 0, '', '2022-11-17 14:21:22.724325', '2022-11-17 14:21:22.724325', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d75279deefe986a94a', 'pinju', NULL, 0, '', '2022-11-17 14:26:54.956170', '2022-11-17 14:26:54.956170', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8369593b25ca331f81', 'mainudin', NULL, 0, '', '2022-11-17 15:57:38.030726', '2022-11-17 15:57:38.030726', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('acaf68c1830e431117', 's k amit', NULL, 0, '', '2022-11-17 17:05:35.916112', '2022-11-17 17:05:35.916112', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a3ee268aeb297cc67c', 'sk amith', NULL, 0, '', '2022-11-17 17:14:03.597308', '2022-11-17 17:14:03.597308', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bbe683850756b4fea3', 'shubhakar', NULL, 0, '', '2022-11-17 18:40:03.725740', '2022-11-17 18:40:03.725740', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8205517f6eef74fdb8', 'mujibulla', NULL, 0, '', '2022-11-17 19:11:59.575012', '2022-11-17 19:11:59.575012', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b97f46899b7671fac9', 'TAPAS BHAG', '8670311929', 0, '', '2022-11-17 19:57:14.487738', '2022-11-17 19:57:14.487738', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7c7d8cea1461e78efe', 'sheikh yakub', '9831331105', 0, '', '2022-11-18 11:17:43.752901', '2022-11-18 11:17:43.752901', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('74d5965231951a732c', 'arsit', NULL, 0, '', '2022-11-18 12:11:07.426367', '2022-11-18 12:11:07.426367', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4369c26d0e1ad2047d', 'suhas', NULL, 0, '', '2022-11-18 13:22:14.390839', '2022-11-18 13:22:14.390839', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2633395ece9a8c41e8', 'habib mondal', NULL, 0, '', '2022-11-18 13:49:40.219184', '2022-11-18 13:49:40.219184', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('76b16dc87cd48e3d19', 'gourab', NULL, 0, '', '2022-11-18 14:00:23.573146', '2022-11-18 14:00:23.573146', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d6700eb50517542b57', 'k k', NULL, 0, '', '2022-11-18 15:35:30.026798', '2022-11-18 15:35:30.026798', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d90f7ffaef71f5b85', 'h m s', NULL, 0, '', '2022-11-18 18:22:52.361232', '2022-11-18 18:22:52.361232', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e8d2eebec209e628d6', 'madam', NULL, 0, '', '2022-11-18 18:47:39.952358', '2022-11-18 18:47:39.952358', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0372d765e9d78c1eae', 'a', NULL, 0, '', '2022-11-18 19:02:38.916515', '2022-11-18 19:02:38.916515', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('238a428d65c40c4353', 'biren', NULL, 0, '', '2022-11-18 21:20:05.993461', '2022-11-18 21:20:05.993461', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a46b27c8d357e0dba', 'rocky', NULL, 0, '', '2022-11-18 21:21:05.454292', '2022-11-18 21:21:05.454292', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4a256ae6430eed9442', 'amith patra', '8618096099', 0, '', '2022-11-19 11:57:28.045316', '2022-11-19 11:57:28.045316', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('694dba03f10f1c926f', 'mr.triveni ranjith', NULL, 0, '', '2022-11-19 12:37:28.218810', '2022-11-19 12:37:28.218810', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('287ea10c5ef918e201', 'altaf', NULL, 0, '', '2022-11-19 13:19:45.856641', '2022-11-19 13:19:45.856641', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6e2d30e56ed5ce1787', 'robin malik', NULL, 0, '', '2022-11-19 13:56:38.933456', '2022-11-19 13:56:38.933456', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('673e9595f286a08f8b', 'sudeep jana', NULL, 0, '', '2022-11-19 17:02:37.167252', '2022-11-19 17:02:37.167252', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62721548a484e00626', 'suman saha', NULL, 0, '', '2022-11-19 18:25:32.529286', '2022-11-19 18:25:32.529286', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fe0a7cb0204bea1cec', 'dheeraj', NULL, 0, '', '2022-11-19 19:12:54.634997', '2022-11-19 19:12:54.634997', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b7206f18a66b29dc95', 'bolanath dada', NULL, 0, '', '2022-11-19 20:46:02.808882', '2022-11-19 20:46:02.808882', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e7e9a3d56c872aac11', 'vje', NULL, 0, '', '2022-11-19 21:42:45.498109', '2022-11-19 21:42:45.498109', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6c0558f3a68c1ba95e', 'laxmi', NULL, 30, '', '2022-11-20 11:55:14.889919', '2022-11-20 11:55:14.889919', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('882b28d4a004122d61', 'darshan r', NULL, 0, '', '2022-11-20 12:57:08.710451', '2022-11-20 12:57:08.710451', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d6511e65af275c604', 'raju bomik', '9113878593', 0, '', '2022-11-21 11:40:39.934427', '2022-11-21 11:40:39.934427', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('89edfd3e088d242cfc', 'r.s', NULL, 0, '', '2022-11-21 13:01:37.268222', '2022-11-21 13:01:37.268222', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1b0e4be01afeacfe8b', 'indrama', NULL, 0, '', '2022-11-21 13:56:16.011131', '2022-11-21 13:56:16.011131', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('deb3c95bf26621a6ed', 'j k', NULL, 0, '', '2022-11-21 14:07:18.331158', '2022-11-21 14:07:18.331158', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('984e2922396a58600a', 'idris ali', '7259020752', 0, '', '2022-11-21 14:28:12.014417', '2022-11-21 14:28:12.014417', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('55f9a65221a455ebb1', 'tapas basuli', NULL, 0, '', '2022-11-21 14:39:36.406982', '2022-11-21 14:39:36.406982', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('52a7edc3721065cb48', 'raj jewels', NULL, 0, '', '2022-11-21 17:39:18.503201', '2022-11-21 17:39:18.503201', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0bb975ab64a2d245dd', 'ismail', NULL, 0, '', '2022-11-21 19:36:41.468287', '2022-11-21 19:36:41.468287', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1baa6d5b1513869cac', 'hari padu', NULL, 0, '', '2022-11-22 11:30:25.947379', '2022-11-22 11:30:25.947379', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('13c28cfdebabe62eae', 'dil', NULL, 0, '', '2022-11-22 11:47:47.076391', '2022-11-22 11:47:47.076391', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2d40c3a6c901b55f6a', 'surjeet bangal', NULL, 0, '', '2022-11-22 15:18:21.544177', '2022-11-22 15:18:21.544177', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ce4e2f8585587d4765', 'j.c', NULL, 0, '', '2022-11-22 19:28:22.212082', '2022-11-22 19:28:22.212082', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('50fa700f4428b490b9', 'aurum', NULL, 0, '', '2022-11-23 12:18:22.072765', '2022-11-23 12:18:22.072765', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a9f3635ce82e68d3a7', 'surjeet sawantho', NULL, 0, '', '2022-11-23 13:35:49.235213', '2022-11-23 13:35:49.235213', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a4fa39ca94b14e6517', 'kallu', NULL, 0, '', '2022-11-23 14:28:14.907993', '2022-11-23 14:28:14.907993', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('401270171b72081be9', 'p j s', NULL, 0, '', '2022-11-23 16:26:39.039247', '2022-11-23 16:26:39.039247', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('510101bea29159b160', 'pintu gora', NULL, 0, '', '2022-11-23 18:19:45.051120', '2022-11-23 18:19:45.051120', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b6c437b79307682d89', 'bablu porell', '9339408446', 0, '', '2022-11-23 19:15:49.869012', '2022-11-23 19:15:49.869012', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('861303d3f49332747c', 'chiran', NULL, 0, '', '2022-11-24 10:10:58.502525', '2022-11-24 10:10:58.502525', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('125ea109d667f89e0d', 'nithaye karmakar', '9382385509', 0, '', '2022-11-24 14:56:14.882163', '2022-11-24 14:56:14.882163', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8e2fe5df59f1826e75', 'manam', NULL, 0, '', '2022-11-24 15:23:07.340180', '2022-11-24 15:23:07.340180', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b4ce701f9d049ec7ae', 'subojeet', NULL, 0, '', '2022-11-24 15:44:40.306851', '2022-11-24 15:44:40.306851', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1184e97f4629dcff25', 's.b', NULL, 0, '', '2022-11-24 16:28:54.560020', '2022-11-24 16:28:54.560020', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c8252fd8b5ee53fce6', 'jaydev das', '8296145914', 0, '', '2022-11-24 19:19:47.117694', '2022-11-24 19:19:47.117694', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('208ab9ba668ab6cf33', 'vikram', NULL, 0, '', '2022-11-25 11:11:12.648411', '2022-11-25 11:11:12.648411', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('363506ca30bd5c5ac6', 'pallavi', NULL, 0, '', '2022-11-25 14:31:16.524538', '2022-11-25 14:31:16.524538', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d92f9df8cbcd6a8f7e', 'sow roopa sugan', NULL, 0, '', '2022-11-25 16:00:45.031902', '2022-11-25 16:00:45.031902', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4f3d88535b4c9da8e2', 'renuka', NULL, 0, '', '2022-11-25 17:20:03.243196', '2022-11-25 17:20:03.243196', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b1022323a42b023a1b', 'mamatha', NULL, 0, '', '2022-11-25 20:29:13.846814', '2022-11-25 20:29:13.846814', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8e5dbe2d92dbb27f0d', 'sukur da', NULL, 0, '', '2022-11-26 13:14:58.594879', '2022-11-26 13:14:58.594879', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4b418d950dada5b180', 'uttham jana', '9036451085', 0, '', '2022-11-26 15:19:21.744805', '2022-11-26 15:19:21.744805', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('15ec8f277d86c441ea', 'suman bhag', '9620493726', 0, '', '2022-11-26 15:27:30.050711', '2022-11-26 15:27:30.050711', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f5c60c37b63fe965b3', 'bolanath ghori', '9593714661', 0, '', '2022-11-26 15:31:57.470850', '2022-11-26 15:31:57.470850', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bbf2852fe80c16e283', 'shantu', NULL, 0, '', '2022-11-26 17:36:34.735948', '2022-11-26 17:36:34.735948', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4f4fb966268a16cfb0', 'goutham samantho', NULL, 0, '', '2022-11-26 19:42:13.159464', '2022-11-26 19:42:13.159464', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60d89ee97f188ca9cc', 'abhijeet dhara', '6360002784', 0, '', '2022-11-26 19:48:11.565778', '2022-11-26 19:48:11.565778', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('732f7baa6b105ce8b4', 'mithun adikari', '8660846219', 0, '', '2022-11-27 12:06:25.960532', '2022-11-27 12:06:25.960532', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b068f2c280499f2348', 'ranjith sarkar', '7406318644', 0, '', '2022-11-27 12:47:03.123329', '2022-11-27 12:47:03.123329', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f59745c658ab5fc69c', 'nirapadu', NULL, 0, '', '2022-11-27 13:12:27.008384', '2022-11-27 13:12:27.008384', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('596fea80bda8ed50bb', 'r.p.s jewellers', NULL, 0, '', '2022-11-27 13:35:50.140078', '2022-11-27 13:35:50.140078', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6d3803d84d2c98abef', 'FKJ', NULL, 0, '', '2022-11-27 13:41:48.047106', '2022-11-27 13:41:48.047106', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('55ed8b768044d65adc', 'darshan', NULL, 0, '', '2022-11-27 14:13:35.041080', '2022-11-27 14:13:35.041080', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b042d2523e1311b004', 'sahin', NULL, 0, '', '2022-11-27 14:57:59.209204', '2022-11-27 14:57:59.209204', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e0007d18881dab1e36', 'chandhan bhai', NULL, 0, '', '2022-11-28 11:25:33.516197', '2022-11-28 11:25:33.516197', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa23619fcc57d52f85', 'raj goria', NULL, 0, '', '2022-11-28 11:47:17.453232', '2022-11-28 11:47:17.453232', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('46694c55a01c101da0', 'sakir', NULL, 0, '', '2022-11-28 12:22:13.724640', '2022-11-28 12:22:13.724640', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3b276da4a5e214ed23', 'sabirul', NULL, 0, '', '2022-11-28 13:51:53.838327', '2022-11-28 13:51:53.838327', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3b521b1a74f0f01643', 's.l.j', NULL, 0, '', '2022-11-28 17:06:19.151412', '2022-11-28 17:06:19.151412', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('419429045d6061d0bd', 'bappa malik', '9382181677', 0, '', '2022-11-28 21:11:04.608951', '2022-11-28 21:11:04.608951', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8fb5734ee0541d6f6b', 'gour shaha', NULL, 0, '', '2022-11-29 14:06:15.253297', '2022-11-29 14:06:15.253297', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('513bbec09a646b0102', 'dev kumar', NULL, 0, '', '2022-11-29 14:16:52.222540', '2022-11-29 14:16:52.222540', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('41a218615d771bafbf', 'vinay', NULL, 0, '', '2022-11-29 20:29:28.436579', '2022-11-29 20:29:28.436579', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b5a1632d04522b5919', 'mujafar', NULL, 0, '', '2022-11-29 20:50:55.612760', '2022-11-29 20:50:55.612760', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('44d9af2f69813dabfc', 'snehal s mehta', NULL, 0, '', '2022-11-29 21:48:48.181426', '2022-11-29 21:48:48.181426', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('badb0eda2d56a53424', 'ritesh', NULL, 0, '', '2022-11-30 12:15:33.408745', '2022-11-30 12:15:33.408745', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e4c6540cef963715af', 'shivkumar', NULL, 0, '', '2022-11-30 12:25:15.856299', '2022-11-30 12:25:15.856299', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('50b8afc684ec406b89', 'm j p', NULL, 0, '', '2022-11-30 12:29:29.678905', '2022-11-30 12:29:29.678905', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0de393a89321551efc', 'sudarshan patra', '9986208874', 0, '', '2022-11-30 14:20:44.133974', '2022-11-30 14:20:44.133974', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7c2d00914d16ed1330', 'subrat maithi', '7019643566', 0, '', '2022-11-30 14:42:52.280515', '2022-11-30 14:42:52.280515', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32c72db5be297d7337', 'modern tools', NULL, 0, '', '2022-11-30 15:21:03.530724', '2022-11-30 15:21:03.530724', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0bd8254243b2f0ff33', 'prashanjeet dhara', '9916366192', 0, '', '2022-11-30 19:01:26.103261', '2022-11-30 19:01:26.103261', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('96b6bda0c94fad5fb0', 'prabhat', NULL, 0, '', '2022-11-30 20:40:47.879888', '2022-11-30 20:40:47.879888', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('07bea131db24aff80f', 'hanish', NULL, 0, '', '2022-11-30 20:47:25.047947', '2022-11-30 20:47:25.047947', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c694b891f311df00a0', 'sudarshan', NULL, 0, '', '2022-11-30 21:31:58.045514', '2022-11-30 21:31:58.045514', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c7ebd3f94e30adb74', 'dalpath', NULL, 0, '', '2022-12-01 12:50:41.637312', '2022-12-01 12:50:41.637312', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c0ff3b69d9045418da', 'faruk', NULL, 0, '', '2022-12-01 16:20:34.081321', '2022-12-01 16:20:34.081321', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e0dea5ff9eaf8be2f0', 'ashish sawantho', '7001735848', 0, '', '2022-12-01 18:54:50.105456', '2022-12-01 18:54:50.105456', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a7725bcbf27d2d7e88', 'syed iqbal', NULL, 0, '', '2022-12-01 19:20:42.220896', '2022-12-01 19:20:42.220896', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c83eb9d22cb15451fa', 'nirmal', NULL, 0, '', '2022-12-01 21:05:16.929474', '2022-12-01 21:05:16.929474', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1b210be60f373b9f41', 'ashwini', NULL, 0, '', '2022-12-01 21:52:19.394071', '2022-12-01 21:52:19.394071', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8f52ad367f3059a5d7', 'imran', NULL, 0, '', '2022-12-02 11:41:23.772994', '2022-12-02 11:41:23.772994', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('298876ecf9bacc516e', 'bijay sawantho', NULL, 0, '', '2022-12-02 18:27:09.364909', '2022-12-02 18:27:09.364909', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('48c2b6b7a8b3fe605e', 'goutham maji', NULL, 0, '', '2022-12-02 18:59:03.992491', '2022-12-02 18:59:03.992491', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cbfa7fb19f6ad9a9b3', 'santu maithye', NULL, 0, '', '2022-12-02 20:52:39.928297', '2022-12-02 20:52:39.928297', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('397fc859524f679999', 'manirul', NULL, 0, '', '2022-12-02 21:01:25.675279', '2022-12-02 21:01:25.675279', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d71d3f71daa9cb09e', 'sabuidhin s k', NULL, 0, '', '2022-12-03 10:00:35.519350', '2022-12-03 10:00:35.519350', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c2a792fa1bb29100b9', 'sujai manik', NULL, 0, '', '2022-12-03 12:24:05.383658', '2022-12-03 12:24:05.383658', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eb8e9c4977fc37b2f4', 'vineet shahu', NULL, 0, '', '2022-12-03 13:16:07.129884', '2022-12-03 13:16:07.129884', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ef5a9fc7b45757e5d2', 'ab', NULL, 0, '', '2022-12-03 15:42:40.404458', '2022-12-03 15:42:40.404458', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('118940fe5fe9e990d8', 'bhairav', NULL, 0, '', '2022-12-03 15:45:07.985952', '2022-12-03 15:45:07.985952', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('04523d0e9df5c80bc9', 'sudeep sawantho', NULL, 0, '', '2022-12-03 18:38:27.715502', '2022-12-03 18:38:27.715502', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dee73add9f37b58d51', 'mohak raj', NULL, 0, '', '2022-12-04 10:41:21.760215', '2022-12-04 10:41:21.760215', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a96e8904e1cf62adfa', 'tarun bomik', '7076534747', 0, '', '2022-12-04 10:49:58.529262', '2022-12-04 10:49:58.529262', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e3d639add972d8f5af', 'mr. raju s.k', NULL, 0, '', '2022-12-04 11:19:17.011715', '2022-12-04 11:19:17.011715', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('df07326c9ba060ca98', 'rajib met', NULL, 0, '', '2022-12-04 13:09:05.649723', '2022-12-04 13:09:05.649723', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6676373458727dbb37', 'asif', NULL, 60, '', '2022-12-05 10:39:48.250451', '2022-12-05 10:39:48.250451', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('54897fb36323afa840', 'azijul', NULL, 0, '', '2022-12-05 10:53:47.093330', '2022-12-05 10:53:47.093330', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b619ba92de1201d53e', 'AJIM', NULL, 0, '', '2022-12-05 12:08:12.036139', '2022-12-05 12:08:12.036139', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9b37c810e5bf6403b8', 'prakash raju', NULL, 0, '', '2022-12-05 13:24:25.778621', '2022-12-05 13:24:25.778621', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('141df794bb234c8982', 'bikas samantho', '7795305626', 0, '', '2022-12-05 14:17:19.229448', '2022-12-05 14:17:19.229448', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eb11679ad2f71af87e', 'debroto singh', NULL, 0, '', '2022-12-05 14:40:54.113125', '2022-12-05 14:40:54.113125', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e7d761631316599d8a', 'gopal bhuyia', NULL, 0, '', '2022-12-05 17:07:07.561650', '2022-12-05 17:07:07.561650', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d838d3ab3066029ed', 'viren', NULL, 0, '', '2022-12-05 17:44:37.100529', '2022-12-05 17:44:37.100529', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6a169c82405e3ff9f5', 'sujeet adak', NULL, 0, '', '2022-12-05 18:15:32.015596', '2022-12-05 18:15:32.015596', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37019e64f4120c2769', 'balama', NULL, 0, '', '2022-12-05 19:24:57.118029', '2022-12-05 19:24:57.118029', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('67523fe084865cd8a3', 'badshah', NULL, 0, '', '2022-12-05 21:21:48.580901', '2022-12-05 21:21:48.580901', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e9d20d80d710e2204e', 'mukund', NULL, 0, '', '2022-12-06 10:52:46.597510', '2022-12-06 10:52:46.597510', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('90351698227727fc38', 'pallab', NULL, 0, '', '2022-12-06 11:45:28.746492', '2022-12-06 11:45:28.746492', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dd2906c316ca73c7ac', 'monish', NULL, 0, '', '2022-12-06 12:08:24.673597', '2022-12-06 12:08:24.673597', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('323037c623f4bcd8c6', 'rajesh c+r', NULL, 3280, '', '2022-12-06 12:24:04.187365', '2022-12-06 12:24:04.187365', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0b7aaf222241a42bff', 'hari patra', NULL, 0, '', '2022-12-06 16:39:55.201260', '2022-12-06 16:39:55.201260', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bfe794c803258a3fb2', 'sonal jewellers', NULL, 0, '', '2022-12-06 17:17:04.535720', '2022-12-06 17:17:04.535720', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9238ff95fd94ad9f72', 'sheik moushasin', NULL, 0, '', '2022-12-06 19:29:18.204978', '2022-12-06 19:29:18.204978', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5bf51b2308193d5269', 'mahika sakeh', NULL, 0, '', '2022-12-06 20:46:56.756267', '2022-12-06 20:46:56.756267', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('49061d3e339227681a', 'somnath das', '9916110471', 0, '', '2022-12-07 12:48:18.104041', '2022-12-07 12:48:18.104041', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3baaded9b030dfdc34', 'lokesh l', NULL, 0, '', '2022-12-07 14:15:40.819654', '2022-12-07 14:15:40.819654', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2212a297fe652b99a7', 'sanjay jana', NULL, 0, '', '2022-12-07 17:34:09.981268', '2022-12-07 17:34:09.981268', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0f73a29459c8096d6d', 'sushanth das', NULL, 0, '', '2022-12-08 11:55:02.200380', '2022-12-08 11:55:02.200380', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('faf68310e0e2f9c6fa', 'sanjeet godiye', '9632051220', 0, '', '2022-12-08 12:48:23.004739', '2022-12-08 12:48:23.004739', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60fa5f0aff3cc03d15', 'sanjay  soni', NULL, 0, '', '2022-12-08 18:38:14.806312', '2022-12-08 18:38:14.806312', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a2e040f89b0a9c1b03', 'n p', NULL, 0, '', '2022-12-08 19:45:37.153967', '2022-12-08 19:45:37.153967', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eca3c708a52ba59c54', 'noor ali', NULL, 0, '', '2022-12-08 21:11:34.769931', '2022-12-08 21:11:34.769931', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c64b61010bbbfcad2f', 'ashok das', NULL, 0, '', '2022-12-09 13:37:03.298249', '2022-12-09 13:37:03.298249', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cb22671efe790d20ed', 'bolanath das', NULL, 0, '', '2022-12-09 15:24:28.735043', '2022-12-09 15:24:28.735043', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9f78f5b910311c4c6d', 'amba bhavni', NULL, 0, '', '2022-12-09 19:54:17.838526', '2022-12-09 19:54:17.838526', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eda19caf5355c150c2', 'SRI BHIMA JEWELS', NULL, 50, '', '2022-12-10 11:48:36.579783', '2022-12-10 11:48:36.579783', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('342d7f231920be0135', 'thiru', NULL, 0, '', '2022-12-10 17:24:16.159888', '2022-12-10 17:24:16.159888', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a1c5e77e36f4b67ea5', 'tukur', NULL, 0, '', '2022-12-10 18:55:11.749032', '2022-12-10 18:55:11.749032', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3bf9c9dcfc34a29006', 'j c', NULL, 0, '', '2022-12-11 11:14:04.794230', '2022-12-11 11:14:04.794230', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f43cf02562c16f70c3', 'saluadhin', NULL, 0, '', '2022-12-12 12:22:09.233029', '2022-12-12 12:22:09.233029', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c544094d20ae08abd7', 'amit adhikare', NULL, 0, '', '2022-12-12 12:30:02.130415', '2022-12-12 12:30:02.130415', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('18f046b912a1b9dbf3', 'k s j', NULL, 0, '', '2022-12-12 14:15:02.243151', '2022-12-12 14:15:02.243151', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a3656a6956a0fc1d3b', 'kishnandu', NULL, 0, '', '2022-12-12 15:44:42.044314', '2022-12-12 15:44:42.044314', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('98c8371a2740ecf760', 'dullal', NULL, 0, '', '2022-12-12 17:31:56.797949', '2022-12-12 17:31:56.797949', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bc4efb873c3738bd59', 'azim', NULL, 0, '', '2022-12-12 19:31:09.637420', '2022-12-12 19:31:09.637420', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3e9b49412629e1b297', 'k j', NULL, 0, '', '2022-12-13 13:47:48.598152', '2022-12-13 13:47:48.598152', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('30fb4256a7eb38d1e7', 'vindo sharma', NULL, 0, '', '2022-12-13 15:05:42.225293', '2022-12-13 15:05:42.225293', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eb9e7f32b62a8a22af', 'aluadhin', NULL, 0, '', '2022-12-13 15:57:11.432952', '2022-12-13 15:57:11.432952', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f3fb4ed2feee906d9d', 'raju jana', NULL, 0, '', '2022-12-13 17:48:20.900940', '2022-12-13 17:48:20.900940', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9510a89f447612b54b', 'raju rana', NULL, 0, '', '2022-12-13 17:48:59.361620', '2022-12-13 17:48:59.361620', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('44885d87a7b1bedbe3', 'mursalim', NULL, 0, '', '2022-12-13 19:13:43.208931', '2022-12-13 19:13:43.208931', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3dbca4e0c5bc11b1c5', 'ranjeet karpa', NULL, 0, '', '2022-12-14 11:38:05.705174', '2022-12-14 11:38:05.705174', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('926c9ada4db6d5385d', 'polash baroye', NULL, 0, '', '2022-12-14 11:55:53.090534', '2022-12-14 11:55:53.090534', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('382173988fa10a24e2', 'manik bera', '9916390604', 0, '', '2022-12-14 11:59:23.132099', '2022-12-14 11:59:23.132099', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c9bc89606617405ad5', 'manojeet patra', NULL, 0, '', '2022-12-14 12:05:55.745653', '2022-12-14 12:05:55.745653', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('535c7d77216e97e59d', 'guru das', NULL, 0, '', '2022-12-14 12:56:08.852600', '2022-12-14 12:56:08.852600', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('971d9e8d922ca61811', 'santu maji', '9972114082', 0, '', '2022-12-14 17:23:39.466313', '2022-12-14 17:23:39.466313', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4b10a1fee482be9910', 'dananjai', NULL, 0, '', '2022-12-14 19:22:45.793003', '2022-12-14 19:22:45.793003', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d884f3010f72d44133', 'subhan', NULL, 0, '', '2022-12-14 21:19:03.520246', '2022-12-14 21:19:03.520246', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b2c698098515d36bf5', 'subho deep', NULL, 0, '', '2022-12-14 21:32:32.741024', '2022-12-14 21:32:32.741024', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('580ca526947bc38d42', 'bikas mondal', '8310486253', 0, '', '2022-12-15 10:09:25.817478', '2022-12-15 10:09:25.817478', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ab6eebae59bcb8d9f7', 'ram da', NULL, 0, '', '2022-12-16 11:27:58.559351', '2022-12-16 11:27:58.559351', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aca1321d4b5f9ea95e', 'montu', NULL, 0, '', '2022-12-16 12:42:25.221620', '2022-12-16 12:42:25.221620', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b454c3926a12e7e539', 'siddhu gorai', '6363968722', 0, '', '2022-12-16 13:33:50.526087', '2022-12-16 13:33:50.526087', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8922538109036edaec', 'deep kotal', '9113925714', 0, '', '2022-12-16 14:43:54.752978', '2022-12-16 14:43:54.752978', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ad49e7e28db8db1ab1', 'abc', NULL, 0, '', '2022-12-16 16:14:14.296538', '2022-12-16 16:14:14.296538', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3228a4c1d3cb17ad95', 'amirul', NULL, 0, '', '2022-12-16 17:55:57.689911', '2022-12-16 17:55:57.689911', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1ada8d0a18b883c3d9', 'shambu shabi', NULL, 0, '', '2022-12-16 19:57:17.814121', '2022-12-16 19:57:17.814121', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f4650c11498db26972', 'kalu', NULL, 0, '', '2022-12-16 21:06:17.927076', '2022-12-16 21:06:17.927076', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('88feb158d377084966', 'haripdau das', '9590895718', 0, '', '2022-12-17 10:20:56.689131', '2022-12-17 10:20:56.689131', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f237a5ca84721bcc92', 'arham jewels', NULL, 0, '', '2022-12-17 11:17:10.979545', '2022-12-17 11:17:10.979545', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b39952188c9625c4cb', 'mohan kumar', NULL, 0, '', '2022-12-17 16:10:37.925850', '2022-12-17 16:10:37.925850', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('41f7577ffaf8a05ea4', 'navarthan jewellers', NULL, 80, '', '2022-12-17 19:02:43.121149', '2022-12-17 19:02:43.121149', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('daab0a7719d7689348', 'seenu', NULL, 0, '', '2022-12-17 20:45:07.172394', '2022-12-17 20:45:07.172394', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3ff85736bc16e9b4f9', 'bijay mandya', NULL, 0, '', '2022-12-19 10:35:56.397624', '2022-12-19 10:35:56.397624', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c0239fa43c749c5774', 'vinay ostwal', NULL, 0, '', '2022-12-19 15:18:50.833764', '2022-12-19 15:18:50.833764', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2099f9b55a75797b4e', 'ishwar', NULL, 0, '', '2022-12-19 17:36:55.985069', '2022-12-19 17:36:55.985069', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('22aeafa5cb3013a4d6', 'ramachari', NULL, 0, '', '2022-12-19 17:39:28.339459', '2022-12-19 17:39:28.339459', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f0d8ad8cf0beabe311', 's.k.j', NULL, 0, '', '2022-12-19 17:51:38.166911', '2022-12-19 17:51:38.166911', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('236c0f7faf776d9bab', 'tapan maji', NULL, 0, '', '2022-12-20 11:09:07.917247', '2022-12-20 11:09:07.917247', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8da46cab824936325f', 'javed ali khan', '8769766927', 0, '', '2022-12-20 11:57:16.350635', '2022-12-20 11:57:16.350635', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('36539e88158b539a77', 'sanjeet sadra', NULL, 30, '', '2022-12-20 12:38:11.403076', '2022-12-20 12:38:11.403076', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dcc79be10c0fc41b46', 'radhe mohan', NULL, 0, '', '2022-12-20 14:15:54.043250', '2022-12-20 14:15:54.043250', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4fd330332c41d30da7', 's c j', NULL, 0, '', '2022-12-20 14:53:53.312335', '2022-12-20 14:53:53.312335', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1edcd2eda4772aab1c', 'raju malik', '8972100376', 0, '', '2022-12-20 17:51:46.911173', '2022-12-20 17:51:46.911173', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d6ba687c00c8881b46', 'jishu', NULL, 0, '', '2022-12-20 20:01:55.726384', '2022-12-20 20:01:55.726384', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('80cb094691f96be260', 'dev maithya', NULL, 0, '', '2022-12-20 21:04:47.704197', '2022-12-20 21:04:47.704197', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('85cd35bcb7d5d1462b', 'gundu', NULL, 0, '', '2022-12-21 15:50:21.632392', '2022-12-21 15:50:21.632392', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8e5727c02ff975ddf1', 'samrat', NULL, 30, '', '2022-12-21 20:22:44.555470', '2022-12-21 20:22:44.555470', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('30352d9aac487a7fb2', 'kingar', NULL, 0, '', '2022-12-22 10:17:06.163241', '2022-12-22 10:17:06.163241', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dd8daa99270faea7bf', 's k s', NULL, 0, '', '2022-12-22 12:19:30.799400', '2022-12-22 12:19:30.799400', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b5e88f00d1cdc287ae', 's k rafique', NULL, 0, '', '2022-12-22 14:22:01.252084', '2022-12-22 14:22:01.252084', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('84e9eebf46005af562', 'biswajeet panja', '9620093051', 0, '', '2022-12-22 15:07:13.182480', '2022-12-22 15:07:13.182480', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a24842f5dfa92fca78', 'dulal', NULL, 0, '', '2022-12-22 16:19:56.230441', '2022-12-22 16:19:56.230441', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4258770336154fbc47', 'ganesh bera', NULL, 0, '', '2022-12-22 17:55:53.605717', '2022-12-22 17:55:53.605717', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('17e0509cfcf538d901', 'shiv kumar', NULL, 0, '', '2022-12-22 18:58:39.131013', '2022-12-22 18:58:39.131013', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9f26a54d13a2226108', 'p s', NULL, 0, '', '2022-12-22 19:50:28.871427', '2022-12-22 19:50:28.871427', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eb89327d4b12926037', 'goutham dulai', '9632289474', 0, '', '2022-12-22 20:25:01.741230', '2022-12-22 20:25:01.741230', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('10b766afcca14cc8ee', 'hemanth bajaj', NULL, 0, '', '2022-12-23 14:06:20.789169', '2022-12-23 14:06:20.789169', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3c1c851b21ede74957', 'hemath bajaj', NULL, 0, '', '2022-12-23 14:10:00.360275', '2022-12-23 14:10:00.360275', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6921cd213c0c8f9c0d', 'sunitha', NULL, 0, '', '2022-12-23 15:20:37.088324', '2022-12-23 15:20:37.088324', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a25d2b8df9e29c0f4a', 'raju dhara', NULL, 0, '', '2022-12-23 18:48:59.386287', '2022-12-23 18:48:59.386287', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('218729fb1b2d8fea9d', 'havish jewels', NULL, 0, '', '2022-12-23 18:51:55.699259', '2022-12-23 18:51:55.699259', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1fa6a2fa0237269aca', 'charan', NULL, 0, '', '2022-12-24 10:41:15.592757', '2022-12-24 10:41:15.592757', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('959558554360d51bd1', 'sushanth', NULL, 0, '', '2022-12-24 11:28:02.331712', '2022-12-24 11:28:02.331712', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3e108685bc83d15ea9', 'basudev', NULL, 0, '', '2022-12-24 11:34:03.086041', '2022-12-24 11:34:03.086041', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9da779ec5cb269dc7a', 't n a', NULL, 0, '', '2022-12-24 14:20:48.983308', '2022-12-24 14:20:48.983308', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4d6fb93c79d60db56f', 'T N E', NULL, 0, '', '2022-12-24 14:21:23.045054', '2022-12-24 14:21:23.045054', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5a1b3818e2dcddecc2', 'ansar gems', NULL, 0, '', '2022-12-24 14:53:36.314239', '2022-12-24 14:53:36.314239', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('010c683888378bfec7', 'thair', NULL, 0, '', '2022-12-24 19:11:06.016401', '2022-12-24 19:11:06.016401', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('772cb9178d008860e1', 'bijay madya', NULL, 0, '', '2022-12-26 10:28:40.770132', '2022-12-26 10:28:40.770132', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a182957b8876b1f5ea', 'satyajeet', NULL, 0, '', '2022-12-26 13:14:52.846387', '2022-12-26 13:14:52.846387', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9e6e39dc156c896cce', 'shiv Ram sawantho', '9538000465', 0, '', '2022-12-26 14:43:13.199715', '2022-12-26 14:43:13.199715', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('451399bb202c257301', 'sudeeptho', NULL, 0, '', '2022-12-26 15:32:25.326206', '2022-12-26 15:32:25.326206', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d2d319de5aa77122d2', 'anitha', NULL, 0, '', '2022-12-26 16:12:18.704176', '2022-12-26 16:12:18.704176', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('08353763ab7b0017cf', 'purshotham', NULL, 0, '', '2022-12-26 16:38:38.875219', '2022-12-26 16:38:38.875219', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2b8376aad8eb41b50d', 'swastik', NULL, 50, '', '2022-12-26 17:49:44.803956', '2022-12-26 17:49:44.803956', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('955cf05698b6dbcf50', 'mastakin', NULL, 0, '', '2022-12-26 18:23:44.444303', '2022-12-26 18:23:44.444303', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ac650d1f32dddb18aa', 'abhijeet', NULL, 0, '', '2022-12-26 20:14:44.371406', '2022-12-26 20:14:44.371406', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a04990286540468e13', 'sapan mata', '7483576125', 0, '', '2022-12-27 10:41:31.869339', '2022-12-27 10:41:31.869339', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c49798b75e0dc83d7a', 'santu mestri', NULL, 0, '', '2022-12-27 12:39:32.356241', '2022-12-27 12:39:32.356241', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3042be9a89162dad26', 'rintu bar', NULL, 0, '', '2022-12-27 18:05:36.376237', '2022-12-27 18:05:36.376237', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1e917a51c6ba8e35ae', 'surjeet dey', NULL, 0, '', '2022-12-27 19:23:33.886170', '2022-12-27 19:23:33.886170', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c910357c7174ed2cda', 'kpj', NULL, 0, '', '2022-12-28 11:31:34.571344', '2022-12-28 11:31:34.571344', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2ffd83b54464edbd34', 'sovindra', NULL, 0, '', '2022-12-28 13:21:11.098397', '2022-12-28 13:21:11.098397', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d76d1501d58ea4f3e', 'karthik pore', '7411761425', 0, '', '2022-12-28 13:47:23.754181', '2022-12-28 13:47:23.754181', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('56f58fd7a0eda719d6', 'ram gorang', '7676406639', 0, '', '2022-12-28 13:57:59.427076', '2022-12-28 13:57:59.427076', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('27445139fe98a94e86', 'amith datu', NULL, 0, '', '2022-12-28 16:16:15.977099', '2022-12-28 16:16:15.977099', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('00c6088b1829a9fec0', 'sandeep mondal', NULL, 0, '', '2022-12-28 16:57:11.108328', '2022-12-28 16:57:11.108328', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3991141d4c570d880c', 's k afsar ali', NULL, 0, '', '2022-12-29 12:09:50.892889', '2022-12-29 12:09:50.892889', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b10e57c09d8fe2f74f', 'tapan gosh', '8618237292', 0, '', '2022-12-29 12:37:55.578190', '2022-12-29 12:37:55.578190', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62bb05e6decf426c7c', 'ahmed', NULL, 0, '', '2022-12-29 18:19:33.686908', '2022-12-29 18:19:33.686908', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5cfb8f714297c9b5e2', 'karthik dada', '8116484695', 0, '', '2022-12-30 10:51:01.656656', '2022-12-30 10:51:01.656656', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2d6a624c69a046b017', 'naren', NULL, 0, '', '2022-12-30 12:32:06.567061', '2022-12-30 12:32:06.567061', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a1e5a5dda32a8e19f6', 'tarun bhag', NULL, 0, '', '2022-12-30 12:39:36.960467', '2022-12-30 12:39:36.960467', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('500f79d089aedc9523', 'polash metae', '8088587682', 0, '', '2022-12-30 12:54:10.594627', '2022-12-30 12:54:10.594627', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c18e2cd06e2c020555', 'taufique', NULL, 0, '', '2022-12-30 12:54:56.113155', '2022-12-30 12:54:56.113155', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('101d15664e044eb67a', 'tushar sasmal', '9113630769', 0, '', '2022-12-30 12:57:44.354357', '2022-12-30 12:57:44.354357', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('49539d42155a41a524', 'abhijeet singh', '8327329925', 0, '', '2022-12-30 13:35:31.992126', '2022-12-30 13:35:31.992126', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('285599cc4e85ec3db0', 'kalli bomik', NULL, 0, '', '2022-12-30 17:10:59.184573', '2022-12-30 17:10:59.184573', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1eea484d541b76a5d4', 'paritosh', NULL, 0, '', '2022-12-30 20:39:43.939775', '2022-12-30 20:39:43.939775', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dac533231236ab1ec2', 'sunil bor', NULL, 0, '', '2022-12-31 10:13:47.432648', '2022-12-31 10:13:47.432648', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ec35dad9b29735d82e', 'tarak maithye', '8892852961', 0, '', '2022-12-31 11:02:51.590389', '2022-12-31 11:02:51.590389', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d6a153ae2b2982496', 'r s 92', NULL, 0, '', '2022-12-31 11:57:03.139433', '2022-12-31 11:57:03.139433', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('769b7ccb887048d426', 'ayan', NULL, 0, '', '2022-12-31 12:03:32.522249', '2022-12-31 12:03:32.522249', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('190245ccb1460d85f5', 'tasina', NULL, 0, '', '2022-12-31 12:47:17.708124', '2022-12-31 12:47:17.708124', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6a8cd16b6169cfe26f', 'milan khan', NULL, 0, '', '2022-12-31 15:07:42.242326', '2022-12-31 15:07:42.242326', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('086b45eee198146e7f', 'surjo das', '8317470126', 0, '', '2022-12-31 15:35:00.332671', '2022-12-31 15:35:00.332671', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('01181e402c602ec176', 'sandeep bera', '8840308814', 0, '', '2022-12-31 15:37:59.059499', '2022-12-31 15:37:59.059499', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b94afc5c73091e328f', 'souvik', NULL, 0, '', '2022-12-31 18:06:39.882088', '2022-12-31 18:06:39.882088', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0fdf0042f1e29dc59a', 'papiye', NULL, 0, '', '2022-12-31 18:07:17.397849', '2022-12-31 18:07:17.397849', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f32ac18f317770fb4b', 'bansi das', '9325410365', 0, '', '2022-12-31 18:26:29.401753', '2022-12-31 18:26:29.401753', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7fa8017c5da4123689', 'raju mandal', '9035423005', 0, '', '2023-01-02 11:44:38.685820', '2023-01-02 11:44:38.685820', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b71c9ffc4da6e530e4', 'shambu dhara', '7602291981', 0, '', '2023-01-02 11:59:16.303239', '2023-01-02 11:59:16.303239', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('22485fd097d81af0ca', 'gorang karmokar', '9742176037', 0, '', '2023-01-02 14:37:23.798345', '2023-01-02 14:37:23.798345', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8495b4a97f87236783', 'nilesh', NULL, 0, '', '2023-01-02 18:57:49.101422', '2023-01-02 18:57:49.101422', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f12ebce11d957b2186', 'jenef', NULL, 0, '', '2023-01-02 19:53:52.065088', '2023-01-02 19:53:52.065088', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0be9dc88c21a86fdce', 'sk rahim', NULL, 0, '', '2023-01-02 21:40:50.281067', '2023-01-02 21:40:50.281067', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d151e57f5bae79919f', 'dharmendar seth', NULL, 0, '', '2023-01-03 13:30:25.221845', '2023-01-03 13:30:25.221845', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3d9e4e830b8caa0bee', 'bablu bera', '9743009751', 0, '', '2023-01-03 14:07:55.886444', '2023-01-03 14:07:55.886444', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4511f45d118339744c', 'subrath', NULL, 0, '', '2023-01-03 15:22:30.577751', '2023-01-03 15:22:30.577751', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b67fe5e22ab8c82ebf', 'madhan battacharya', NULL, 0, '', '2023-01-03 17:04:43.786097', '2023-01-03 17:04:43.786097', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f2a70bbc10d15b9d9d', 'vina', NULL, 0, '', '2023-01-03 17:15:42.049489', '2023-01-03 17:15:42.049489', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cd4bb579dcd15bf984', 'NAUSIM SHEK', NULL, 0, '', '2023-01-03 20:53:53.817544', '2023-01-03 20:53:53.817544', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6753c405250de5d854', 'BASUDEV JANA', NULL, 0, '', '2023-01-03 20:55:08.407332', '2023-01-03 20:55:08.407332', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('914752de93ed7b5bd5', 'sk mohasim', NULL, 0, '', '2023-01-04 15:01:23.904242', '2023-01-04 15:01:23.904242', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3109b0f1d4f99b6f0e', 'gorang pal', NULL, 0, '', '2023-01-04 17:10:01.458971', '2023-01-04 17:10:01.458971', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c5006387d5a6eeae16', 'bablu bhai', NULL, 0, '', '2023-01-04 20:15:24.397645', '2023-01-04 20:15:24.397645', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('05ef7cb2b9a9ba7ac0', 'shantha mestri', NULL, 0, '', '2023-01-05 14:14:22.761786', '2023-01-05 14:14:22.761786', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3e9b255a2989f0da6a', 'sk habib', NULL, 0, '', '2023-01-05 14:49:23.660510', '2023-01-05 14:49:23.660510', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dfdd054d11dbde7d6c', 'raju sheikh', NULL, 0, '', '2023-01-05 15:00:20.450375', '2023-01-05 15:00:20.450375', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9487285d315c2dba9e', 'mohantu bera', '6361562836', 0, '', '2023-01-05 15:35:35.469020', '2023-01-05 15:35:35.469020', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fbbd5ec85ede82c7a3', 'sow sujatha', NULL, 0, '', '2023-01-05 19:08:02.072461', '2023-01-05 19:08:02.072461', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('12c1a937d01368e53a', 'nikhil', NULL, 0, '', '2023-01-05 19:14:11.452437', '2023-01-05 19:14:11.452437', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('468bcdaf0c67a4cb52', 'radhe govindo', NULL, 0, '', '2023-01-05 19:21:53.434840', '2023-01-05 19:21:53.434840', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d3f6192262b250ff62', 'nikitha', NULL, 0, '', '2023-01-05 19:44:13.609388', '2023-01-05 19:44:13.609388', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('812e0a61ce951122c8', 's.k.s', NULL, 0, '', '2023-01-06 13:47:26.398095', '2023-01-06 13:47:26.398095', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2b49a3b1ca32b7cdba', 'govind raj', NULL, 0, '', '2023-01-06 13:50:30.565393', '2023-01-06 13:50:30.565393', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eab70aabb46ea2a1d1', 'mohammed', NULL, 0, '', '2023-01-06 15:44:17.595873', '2023-01-06 15:44:17.595873', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('68cb5ccae9bdfd6238', 'dinu', NULL, 0, '', '2023-01-06 18:18:15.561652', '2023-01-06 18:18:15.561652', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2f59bf67f71271ffdc', 'sabhir', NULL, 0, '', '2023-01-06 18:55:14.171096', '2023-01-06 18:55:14.171096', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6570d5ed5abf086186', 'sanjay soni', NULL, 0, '', '2023-01-06 19:49:58.975651', '2023-01-06 19:49:58.975651', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9fc3ef196f86bde0f8', 'b c', NULL, 0, '', '2023-01-06 20:02:49.990037', '2023-01-06 20:02:49.990037', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('179933b0371528f765', 'sriraj', NULL, 0, '', '2023-01-06 21:23:00.934784', '2023-01-06 21:23:00.934784', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('57f2a8533b6a220e77', 'polah bangal', NULL, 0, '', '2023-01-07 11:35:16.496874', '2023-01-07 11:35:16.496874', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e95046e5a7427804a9', 'sushil bhag', NULL, 0, '', '2023-01-07 13:37:37.549781', '2023-01-07 13:37:37.549781', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('59f0779c560040eb8b', 's k bappa', '9606662278', 0, '', '2023-01-07 14:29:02.144395', '2023-01-07 14:29:02.144395', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('323fcd80b2f4e086bb', 's ali', NULL, 0, '', '2023-01-07 15:10:50.658947', '2023-01-07 15:10:50.658947', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('76e3ba8caee536cc88', 'moti', NULL, 0, '', '2023-01-07 15:20:22.638210', '2023-01-07 15:20:22.638210', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('78eaeccd6fd9568c18', 'mohamad', NULL, 0, '', '2023-01-07 16:11:02.141106', '2023-01-07 16:11:02.141106', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8baed85f5d57c1473f', 'drishti diamond', NULL, 0, '', '2023-01-07 18:47:35.075348', '2023-01-07 18:47:35.075348', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a8dcdff2917de5f036', 'mubarak', NULL, 0, '', '2023-01-07 19:44:45.844910', '2023-01-07 19:44:45.844910', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('49bec3f634d4e89305', 'sakhi', NULL, 0, '', '2023-01-07 20:09:03.598304', '2023-01-07 20:09:03.598304', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9528193bd5e5bae6d2', 'anupama', NULL, 0, '', '2023-01-07 21:06:08.348504', '2023-01-07 21:06:08.348504', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a8e9627bb7c3d0679', 'shokat ali', NULL, 0, '', '2023-01-07 21:23:21.669810', '2023-01-07 21:23:21.669810', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('092f2071d1d73a1954', 'mahaveer chand', NULL, 0, '', '2023-01-08 12:07:28.040694', '2023-01-08 12:07:28.040694', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d32b4839d927b7e03a', 'rafique', NULL, 30, '', '2023-01-08 14:16:39.899982', '2023-01-08 14:16:39.899982', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d6c1dc38dfc825ed6c', 'gopinath', NULL, 0, '', '2023-01-09 10:49:13.412100', '2023-01-09 10:49:13.412100', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('345de72d18232e84ad', 'bangle', NULL, 0, '', '2023-01-09 12:43:37.031455', '2023-01-09 12:43:37.031455', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c5744971513093c194', 'mani', NULL, 0, '', '2023-01-09 13:24:40.662481', '2023-01-09 13:24:40.662481', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37bf286076cb6768e1', 'n s jewels', NULL, 0, '', '2023-01-09 16:28:43.005543', '2023-01-09 16:28:43.005543', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6dfe2d4f3c4a2547ae', 'r', NULL, 0, '', '2023-01-09 16:44:18.790640', '2023-01-09 16:44:18.790640', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aeff430c29feaa974d', 'verma', NULL, 0, '', '2023-01-09 17:09:20.543854', '2023-01-09 17:09:20.543854', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a593d61e46b87848d2', 'sameer maithi', '9742176072', 0, '', '2023-01-10 11:52:17.537052', '2023-01-10 11:52:17.537052', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c47a40e6b57b374649', 'pooja', NULL, 0, '', '2023-01-10 15:37:47.295607', '2023-01-10 15:37:47.295607', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('33811df984d5d476ff', 'thriu', NULL, 0, '', '2023-01-10 18:06:07.659571', '2023-01-10 18:06:07.659571', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b0eb744cbcc3ead52f', 'uttham rao', '8095292804', 0, '', '2023-01-10 18:08:08.933683', '2023-01-10 18:08:08.933683', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3dfa25a693e66447e8', 'bablu tung', '9036462930', 0, '', '2023-01-10 18:11:49.067652', '2023-01-10 18:11:49.067652', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2812cad8c4e30ecf01', 'sibu', NULL, 0, '', '2023-01-10 18:54:52.325459', '2023-01-10 18:54:52.325459', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e1a6d669abfc9cb586', 'heeru', NULL, 0, '', '2023-01-10 20:04:25.331056', '2023-01-10 20:04:25.331056', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('30d7cef96aa687fbc3', 'shymul maithy', NULL, 0, '', '2023-01-10 20:21:18.291275', '2023-01-10 20:21:18.291275', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c3952b30c0c0616f4f', 'suman kabi', '9986228072', 0, '', '2023-01-11 10:40:17.307957', '2023-01-11 10:40:17.307957', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('835a78eef227b37f9e', 'bhaskar maithye', '8147937613', 0, '', '2023-01-11 12:10:21.171521', '2023-01-11 12:10:21.171521', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a64f258602be95b20b', 's banarjee', NULL, 0, '', '2023-01-11 17:53:17.873888', '2023-01-11 17:53:17.873888', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7aa0c965b30e515aa8', 'govindo sadra', '9064991607', 0, '', '2023-01-11 18:47:57.850723', '2023-01-11 18:47:57.850723', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('984a4eda9cee1d7291', 'bala kumara', NULL, 0, '', '2023-01-11 20:12:55.042456', '2023-01-11 20:12:55.042456', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8fff84d095a266b2bc', 'sharan', NULL, 0, '', '2023-01-12 17:31:53.046548', '2023-01-12 17:31:53.046548', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cd01cd432b02e99b0d', 'prajwal pasalkar', NULL, 0, '', '2023-01-13 12:44:26.015015', '2023-01-13 12:44:26.015015', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b9a931d06353f09b9f', 'samresh maithi', NULL, 0, '', '2023-01-13 13:19:23.592040', '2023-01-13 13:19:23.592040', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c9db1fca7b542ffcf7', 'mars jewellers', NULL, 0, '', '2023-01-13 14:24:51.715372', '2023-01-13 14:24:51.715372', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e6988723bb198bf92e', 'ns', NULL, 0, '', '2023-01-13 14:25:47.644322', '2023-01-13 14:25:47.644322', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e5cd42412b897a889f', 'rajesh gold', NULL, 0, '', '2023-01-13 14:57:45.364732', '2023-01-13 14:57:45.364732', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0bdc4513b7bdea6b45', 'tahir', NULL, 0, '', '2023-01-13 17:20:04.404454', '2023-01-13 17:20:04.404454', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('341ffc1d569689bec7', 'samit', NULL, 0, '', '2023-01-14 12:16:49.949459', '2023-01-14 12:16:49.949459', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6a55b5de1d77f60388', 'pijush kumar', NULL, 0, '', '2023-01-15 10:33:03.619395', '2023-01-15 10:33:03.619395', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('85cf3591cd47b1dcf6', 'gjn', NULL, 0, '', '2023-01-15 12:41:26.875131', '2023-01-15 12:41:26.875131', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2ffde1de78d4708673', 'sameer kole', NULL, 0, '', '2023-01-15 13:24:33.971431', '2023-01-15 13:24:33.971431', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9a39526a3c52cbe164', 'piyo', NULL, 0, '', '2023-01-16 11:21:53.017093', '2023-01-16 11:21:53.017093', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f330d4141275fd7ad4', 'mr gagan', NULL, 0, '', '2023-01-16 14:00:01.765088', '2023-01-16 14:00:01.765088', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('99b03d6256d1262310', 'kharol saab', NULL, 0, '', '2023-01-16 14:08:26.527578', '2023-01-16 14:08:26.527578', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('781d639920380d3e99', 'dwitin', NULL, 0, '', '2023-01-17 16:01:30.814730', '2023-01-17 16:01:30.814730', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('33b2f3f89de1639c5b', 'raja sk', NULL, 0, '', '2023-01-17 17:14:28.582087', '2023-01-17 17:14:28.582087', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a3772cde14446de59a', 'anand ghuyia', '8073543929', 0, '', '2023-01-17 20:53:30.187371', '2023-01-17 20:53:30.187371', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('80691e2684f6711367', 'sandeep pal', NULL, 0, '', '2023-01-18 14:26:56.468828', '2023-01-18 14:26:56.468828', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1002141ce0c4b32746', 'sushanth biswanath', '8050914624', 0, '', '2023-01-18 14:30:34.604677', '2023-01-18 14:30:34.604677', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f29024762701f3c271', 'ranjeet patra', NULL, 0, '', '2023-01-18 16:26:39.728563', '2023-01-18 16:26:39.728563', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ae285cee0b3b872375', 'sudharshan patra', NULL, 0, '', '2023-01-18 18:19:39.290119', '2023-01-18 18:19:39.290119', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('40e15dd6ecb5c393f4', 'r v c', NULL, 0, '', '2023-01-18 18:39:53.579156', '2023-01-18 18:39:53.579156', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('866f7b6b8f7f05bb21', 'tarun pradhan', NULL, 0, '', '2023-01-18 18:46:13.138912', '2023-01-18 18:46:13.138912', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1a9ca60256971ea2d1', 'mr sai kumar', NULL, 0, '', '2023-01-18 20:40:19.234914', '2023-01-18 20:40:19.234914', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('14247a44a64e10342b', 'panchlama', NULL, 0, '', '2023-01-19 11:40:18.996919', '2023-01-19 11:40:18.996919', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ad15ad6ea38854f001', 'alaudhin mola', '9844442943', 0, '', '2023-01-19 12:27:28.910643', '2023-01-19 12:27:28.910643', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1f5d8204dc65ad9e77', 'pradeep sawantho', '6366107424', 0, '', '2023-01-19 14:44:13.316672', '2023-01-19 14:44:13.316672', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fc15b4c394980c6611', 'bijay sarkar', NULL, 0, '', '2023-01-19 17:27:25.915018', '2023-01-19 17:27:25.915018', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37a4ee8cbfaa474929', 'munni bairappa', NULL, 0, '', '2023-01-19 19:09:30.251061', '2023-01-19 19:09:30.251061', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('33547df9419cb3ef9d', 'arun mandal', '9035810302', 0, '', '2023-01-19 20:12:19.235574', '2023-01-19 20:12:19.235574', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2b659e91302f234067', 'sudeep bolu', NULL, 0, '', '2023-01-19 21:02:47.731256', '2023-01-19 21:02:47.731256', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0cfc2cb05560d65fbb', 'abbas', NULL, 0, '', '2023-01-20 10:43:01.001405', '2023-01-20 10:43:01.001405', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('419315c8f2de414b2b', 'devnath', NULL, 0, '', '2023-01-20 17:05:27.674311', '2023-01-20 17:05:27.674311', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a1922d3cca54135228', 'shelkey', NULL, 0, '', '2023-01-20 21:41:09.173272', '2023-01-20 21:41:09.173272', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b751bdf08c35a1cff6', 'mr darshan', NULL, 0, '', '2023-01-21 16:44:38.905076', '2023-01-21 16:44:38.905076', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9ca456be29f6467f6b', 'pritam', NULL, 0, '', '2023-01-21 18:34:22.913719', '2023-01-21 18:34:22.913719', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('79595399503a5ef664', 'abhishek', NULL, 0, '', '2023-01-21 20:28:07.615926', '2023-01-21 20:28:07.615926', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2d45f37193763a81d8', 'abhi mandal 1', '8496068944', 0, '', '2023-01-21 21:32:22.556898', '2023-01-21 21:32:22.556898', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3dc7c3e4535b16f27f', 'sujith', NULL, 0, '', '2023-01-22 13:06:41.780048', '2023-01-22 13:06:41.780048', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0edbcb406053c6c288', 'nandu durlab', '8861062364', 0, '', '2023-01-22 14:01:47.898649', '2023-01-22 14:01:47.898649', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('325d17b2b3de886f9c', 'sudeep mondal', NULL, 0, '', '2023-01-22 14:32:13.871856', '2023-01-22 14:32:13.871856', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('136270b90e58f99f90', 'jp', NULL, 0, '', '2023-01-23 11:07:44.325712', '2023-01-23 11:07:44.325712', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f4d056a3ce594718cc', 'santosh', NULL, 0, '', '2023-01-23 14:04:03.674504', '2023-01-23 14:04:03.674504', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3535b1c916bb8b3929', 'asit singh', '9945213492', 0, '', '2023-01-23 14:07:46.340724', '2023-01-23 14:07:46.340724', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ebc514f129a97c5042', 'chotto', NULL, 0, '', '2023-01-23 15:46:27.808079', '2023-01-23 15:46:27.808079', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b5dbc694226b2492e8', 'archana tiwari', NULL, 0, '', '2023-01-23 17:37:26.225288', '2023-01-23 17:37:26.225288', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eeaffff2215646db58', 'rajan', NULL, 0, '', '2023-01-23 19:04:38.896261', '2023-01-23 19:04:38.896261', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a0aee7f053c2cb2b61', 'ganesh monal', NULL, 0, '', '2023-01-23 19:31:44.906836', '2023-01-23 19:31:44.906836', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e94d63fcba5aa33887', 'krihna mohan guyia', '9538358688', 0, '', '2023-01-24 12:21:48.517018', '2023-01-24 12:21:48.517018', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d2311ce33dc390a9ce', 'yeshwanth', NULL, 0, '', '2023-01-24 13:39:28.947924', '2023-01-24 13:39:28.947924', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('066357b3338a7eb16e', 'laltu adak', NULL, 0, '', '2023-01-24 20:57:24.345744', '2023-01-24 20:57:24.345744', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('edff37bee0141b4baa', 'nobo', NULL, 0, '', '2023-01-25 11:57:47.104617', '2023-01-25 11:57:47.104617', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('008b31c2fcd25d06ce', 'satyanath', NULL, 0, '', '2023-01-25 13:50:57.561737', '2023-01-25 13:50:57.561737', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('db30213d668b7984fa', 'abhijeet mana', NULL, 0, '', '2023-01-25 15:14:01.466395', '2023-01-25 15:14:01.466395', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b56fb9c2aeac639ae3', 'abhijeet sawanth', NULL, 30, '', '2023-01-25 18:29:45.947123', '2023-01-25 18:29:45.947123', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d53d6be289678dcf36', 'rajeev bank', NULL, 0, '', '2023-01-25 19:02:28.739774', '2023-01-25 19:02:28.739774', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c95fef3c1b98eef418', 'jiyarul', NULL, 0, '', '2023-01-26 13:32:13.701125', '2023-01-26 13:32:13.701125', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ae5a49d229032721f0', 'd k sharma', NULL, 0, '', '2023-01-26 15:06:00.798851', '2023-01-26 15:06:00.798851', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6e921901b6939d4b47', 'ashray', NULL, 0, '', '2023-01-26 16:22:30.253610', '2023-01-26 16:22:30.253610', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ceb751922ccd520450', 'kishan', NULL, 0, '', '2023-01-26 18:40:21.862921', '2023-01-26 18:40:21.862921', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('46907d4a4c237f7792', 'shyamal devnath', NULL, 0, '', '2023-01-27 18:07:50.191450', '2023-01-27 18:07:50.191450', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('40cda269279eb9c1e1', 'tabarak', NULL, 0, '', '2023-01-27 20:07:39.607894', '2023-01-27 20:07:39.607894', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7103980d5fa09bc233', 'ratnakar gold', NULL, 0, '', '2023-01-28 12:22:24.019887', '2023-01-28 12:22:24.019887', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('22a8c7fc023958a7b5', 'sanjeev malik', NULL, 0, '', '2023-01-28 13:08:34.662629', '2023-01-28 13:08:34.662629', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('290b3b28fc5a0a8922', 'lalith', NULL, 0, '', '2023-01-28 15:39:35.644619', '2023-01-28 15:39:35.644619', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a1aed2ad03b708f351', 'sow  valipati', NULL, 0, '', '2023-01-28 20:55:36.940188', '2023-01-28 20:55:36.940188', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f27dd90a80c1720415', 'devesh', NULL, 0, '', '2023-01-29 10:41:14.610938', '2023-01-29 10:41:14.610938', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f7af5673d9a96e5d38', 'sukumar maithye', '9880184979', 0, '', '2023-01-29 13:47:04.512449', '2023-01-29 13:47:04.512449', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2f9a0b63597ebe4920', 'anup rana', NULL, 0, '', '2023-01-29 14:05:33.724128', '2023-01-29 14:05:33.724128', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f5da6c1a68626111bf', 'nj city street', NULL, 0, '', '2023-01-29 15:24:05.542981', '2023-01-29 15:24:05.542981', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('359d917e9612839370', 'rajkumar manna', NULL, 0, '', '2023-01-30 10:59:01.428581', '2023-01-30 10:59:01.428581', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d3dbcdca33a9b17f8d', 'sheikh azizul', '6362997953', 0, '', '2023-01-30 12:12:21.389496', '2023-01-30 12:12:21.389496', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8c7f1e3893a0bd8922', 'surabi jewels', NULL, 0, '', '2023-01-30 14:12:46.273828', '2023-01-30 14:12:46.273828', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d2b8e82d4ad71bf224', 'sameer da', NULL, 0, '', '2023-01-30 15:03:12.410659', '2023-01-30 15:03:12.410659', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d952ba268902743604', 'sourav', NULL, 0, '', '2023-01-30 20:39:52.966175', '2023-01-30 20:39:52.966175', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1694e8a2ff8436e05d', 'pbt', NULL, 0, '', '2023-01-30 21:23:19.792516', '2023-01-30 21:23:19.792516', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b02354ef1946b8d9c3', 'amal satra', NULL, 0, '', '2023-01-31 12:04:11.461478', '2023-01-31 12:04:11.461478', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fe68a5e1924b94f3ca', 'bhavani', NULL, 0, '', '2023-01-31 14:52:30.804015', '2023-01-31 14:52:30.804015', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5f5c0631bf78d44732', 'prabhakar', NULL, 0, '', '2023-01-31 14:53:08.852799', '2023-01-31 14:53:08.852799', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a7b88ee2fe434b788', 'shambu', NULL, 0, '', '2023-01-31 16:07:42.715903', '2023-01-31 16:07:42.715903', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a8eea50bc1418f183c', 'biswajeet sarkar', NULL, 0, '', '2023-01-31 18:02:45.312571', '2023-01-31 18:02:45.312571', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('91d271ab7fa06cf729', 'vinod', NULL, 0, '', '2023-01-31 19:10:17.051484', '2023-01-31 19:10:17.051484', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('568327dabf4f4e27ab', 'sayed iqbal', NULL, 0, '', '2023-02-01 11:37:39.445050', '2023-02-01 11:37:39.445050', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('351977fba84ae77b53', 'usman', NULL, 0, '', '2023-02-01 11:39:14.444748', '2023-02-01 11:39:14.444748', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6475d4ac3225ecb29d', 'kj', NULL, 0, '', '2023-02-01 15:11:31.118921', '2023-02-01 15:11:31.118921', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ec89fbb8b234822b70', 'anup patra', NULL, 0, '', '2023-02-01 15:44:49.462031', '2023-02-01 15:44:49.462031', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3911dac8632e30eb6a', 'ibrahim', NULL, 0, '', '2023-02-01 16:28:25.260959', '2023-02-01 16:28:25.260959', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('11b9bf71c2c968a927', 'debesh', NULL, 0, '', '2023-02-02 13:11:13.723159', '2023-02-02 13:11:13.723159', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c56e2093ce71d0b249', 'kushal', NULL, 0, '', '2023-02-02 14:19:21.360956', '2023-02-02 14:19:21.360956', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dec8fe1880effe9dfa', 'pj', NULL, 0, '', '2023-02-02 15:02:53.491155', '2023-02-02 15:02:53.491155', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d37b3ef2dc493a382', 'aditya', NULL, 0, '', '2023-02-02 19:52:18.060857', '2023-02-02 19:52:18.060857', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4a16271c487556ca44', 'shivash', NULL, 0, '', '2023-02-03 12:33:35.594933', '2023-02-03 12:33:35.594933', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c3c9772f82f8f56804', 'd c', NULL, 0, '', '2023-02-03 17:24:19.199168', '2023-02-03 17:24:19.199168', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8039ad39a8ef3da434', 'deba patra', NULL, 0, '', '2023-02-03 18:33:05.785684', '2023-02-03 18:33:05.785684', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8eaa71ab8d03a260e9', 'nk', NULL, 0, '', '2023-02-03 21:08:50.247217', '2023-02-03 21:08:50.247217', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5f0d690b8b214bfdbf', 'loki', NULL, 0, '', '2023-02-04 14:05:58.303262', '2023-02-04 14:05:58.303262', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4f315acb351e39d595', 'rajeev gayan', NULL, 0, '', '2023-02-04 19:05:51.512301', '2023-02-04 19:05:51.512301', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3a44ec0a90be90fd97', 'jai', NULL, 0, '', '2023-02-05 13:39:22.848982', '2023-02-05 13:39:22.848982', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c51e7df7d1874aa43e', 'sujay adikari', '6382696074', 0, '', '2023-02-06 11:29:18.132350', '2023-02-06 11:29:18.132350', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('98fafd92e71eb3066e', 'gopal shah', '8310005063', 30, '', '2023-02-06 11:34:11.460657', '2023-02-06 11:34:11.460657', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4ba07a0fa0286f612a', 'goutham poria', NULL, 0, '', '2023-02-06 16:08:06.335767', '2023-02-06 16:08:06.335767', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c8b30bd05fb85fc607', 'g shankar', '6361478094', 0, '', '2023-02-06 18:01:40.061143', '2023-02-06 18:01:40.061143', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1f40132ef0d20918dd', 'adi mondal', '9886241348', 0, '', '2023-02-06 20:10:26.536561', '2023-02-06 20:10:26.536561', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e66a25e0c0043ce9e8', 's v r', NULL, 0, '', '2023-02-06 20:41:54.390120', '2023-02-06 20:41:54.390120', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f32da1e7e9fbb3e158', 'j v s', NULL, 0, '', '2023-02-07 12:11:39.604473', '2023-02-07 12:11:39.604473', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ddb73fa5581e2f343c', 'j v s ( p )', NULL, 0, '', '2023-02-07 12:12:12.988218', '2023-02-07 12:12:12.988218', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b87b073888ef1db67a', 'madey', NULL, 0, '', '2023-02-07 12:28:41.200907', '2023-02-07 12:28:41.200907', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eec6af8f832ef2114a', 'subhojeet sawantho', NULL, 0, '', '2023-02-07 13:39:55.292654', '2023-02-07 13:39:55.292654', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('103f565fd9e9e0762d', 'barun das', NULL, 0, '', '2023-02-07 13:59:35.420335', '2023-02-07 13:59:35.420335', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('859cd3ef1ee2fa290d', 's j', NULL, 0, '', '2023-02-07 14:55:15.504657', '2023-02-07 14:55:15.504657', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1333f710c9eb6188cf', 'hussain', NULL, 0, '', '2023-02-07 15:12:25.546411', '2023-02-07 15:12:25.546411', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('84a71bc5b96d68594f', 'mataji jewellers', NULL, 0, '', '2023-02-07 16:24:53.950956', '2023-02-07 16:24:53.950956', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f08bd469ff5e3ea9d7', 'raju mete', NULL, 0, '', '2023-02-07 16:25:46.767042', '2023-02-07 16:25:46.767042', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7bb97109274bb3686a', 'biswa', NULL, 0, '', '2023-02-07 18:14:21.744148', '2023-02-07 18:14:21.744148', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f296c26400b4bba420', 'biswajeet singha', '8147831030', 0, '', '2023-02-07 18:18:31.680999', '2023-02-07 18:18:31.680999', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('651b410f01fb22e290', 'polash bangal', NULL, 0, '', '2023-02-08 13:27:07.175712', '2023-02-08 13:27:07.175712', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3e2a7e073addc231de', 'bhubai', NULL, 0, '', '2023-02-08 13:41:30.320252', '2023-02-08 13:41:30.320252', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c703603a7154192001', 'banesar', NULL, 0, '', '2023-02-08 17:31:56.112384', '2023-02-08 17:31:56.112384', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aacb5067c9043ae826', 'gopal saha', NULL, 0, '', '2023-02-08 17:33:41.914234', '2023-02-08 17:33:41.914234', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f9833055f59cc4a828', 'sujan', NULL, 0, '', '2023-02-09 15:42:13.368300', '2023-02-09 15:42:13.368300', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('497ce59d8c9f3df2dc', 'dhalim sheikh', NULL, 0, '', '2023-02-09 18:44:47.258324', '2023-02-09 18:44:47.258324', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('14b37b761e97b00029', 'rahim', NULL, 0, '', '2023-02-09 20:39:46.802223', '2023-02-09 20:39:46.802223', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea24ac7e30b0b0e25b', 'shanthi jewels', NULL, 0, '', '2023-02-10 16:30:25.555920', '2023-02-10 16:30:25.555920', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e0f1f943655f71756f', 'subrotho sadra', '8073976425', 0, '', '2023-02-10 18:35:32.241375', '2023-02-10 18:35:32.241375', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c256fa63667841af76', 'b jana', NULL, 0, '', '2023-02-11 10:55:16.695253', '2023-02-11 10:55:16.695253', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d540f1cf1124edfe00', 'rajeev adakari', NULL, 0, '', '2023-02-11 12:36:31.861808', '2023-02-11 12:36:31.861808', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('683678b9771348f16c', 'p j p', NULL, 0, '', '2023-02-11 12:51:41.326562', '2023-02-11 12:51:41.326562', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('09db496db4f084bc31', 'm jewels', NULL, 0, '', '2023-02-11 15:22:51.300961', '2023-02-11 15:22:51.300961', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('136d0c05321d1e799c', 'allam', NULL, 0, '', '2023-02-11 17:33:30.256405', '2023-02-11 17:33:30.256405', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2baa21e7b0317f48ab', 'ramanji anappa', NULL, 0, '', '2023-02-11 20:24:05.908946', '2023-02-11 20:24:05.908946', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b921d647f60cb27326', 'shiv shankar', NULL, 0, '', '2023-02-12 10:37:09.357508', '2023-02-12 10:37:09.357508', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('741b6e7e826ad57cfb', 'bje', NULL, 0, '', '2023-02-12 11:55:48.799308', '2023-02-12 11:55:48.799308', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1a2ed890462f3fde64', 'arun manna', '8220285730', 0, '', '2023-02-12 13:05:43.951128', '2023-02-12 13:05:43.951128', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c21739f52776097518', 'bappi samantho', NULL, 0, '', '2023-02-12 14:30:50.776543', '2023-02-12 14:30:50.776543', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('20fb16f844a061087a', 'sajal sasmal', NULL, 0, '', '2023-02-13 15:18:18.121130', '2023-02-13 15:18:18.121130', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fa5bee1647d5e5f64e', 'kochee', NULL, 0, '', '2023-02-13 18:29:17.136241', '2023-02-13 18:29:17.136241', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('78618718a4633533f8', 'anup mandal', NULL, 0, '', '2023-02-13 19:32:34.516649', '2023-02-13 19:32:34.516649', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ca934aa2fac7a9835e', 'kamal mishra', '7872159727', 0, '', '2023-02-14 12:57:02.999081', '2023-02-14 12:57:02.999081', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('355b1c7b1937611f71', 'amith pal', '8847348428', 0, '', '2023-02-14 13:34:19.294280', '2023-02-14 13:34:19.294280', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d354c961f4dba43afa', 'a b', NULL, 0, '', '2023-02-14 15:54:11.417728', '2023-02-14 15:54:11.417728', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ecd6ebc14309d48093', 'deepak mondal', NULL, 0, '', '2023-02-14 16:12:33.417880', '2023-02-14 16:12:33.417880', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('39f3ceddd9c7ad8a14', 'hemanthu laskar', NULL, 0, '', '2023-02-14 16:29:54.609855', '2023-02-14 16:29:54.609855', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a72cc0ae1071396ed4', 'ramesh sawantho', NULL, 0, '', '2023-02-14 16:39:38.547181', '2023-02-14 16:39:38.547181', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('80dff52a4a93571afb', 'bijay shankar', NULL, 0, '', '2023-02-14 20:40:58.903041', '2023-02-14 20:40:58.903041', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('99cb6affaad1d12e2c', 'gunodhar sawanth', NULL, 0, '', '2023-02-15 16:05:14.846179', '2023-02-15 16:05:14.846179', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('afc5d8f5f0640ce595', 'mohan roy', NULL, 0, '', '2023-02-15 18:47:48.577915', '2023-02-15 18:47:48.577915', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('80e339016f2758a39c', 'ram patra', NULL, 0, '', '2023-02-15 19:23:12.847700', '2023-02-15 19:23:12.847700', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('99d6caed3674695f1f', 'pvt', NULL, 0, '', '2023-02-16 12:22:13.449149', '2023-02-16 12:22:13.449149', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('de303adfcb6c784786', 'sharvan singh', NULL, 0, '', '2023-02-16 15:14:59.975217', '2023-02-16 15:14:59.975217', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cc1020ddfc49e38176', 'bikam', NULL, 0, '', '2023-02-16 15:48:37.602874', '2023-02-16 15:48:37.602874', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bad211ac5898479c10', 'sajol sasmal', NULL, 0, '', '2023-02-16 16:35:47.244178', '2023-02-16 16:35:47.244178', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('be08413e21dbaf2a11', 'badshahh screw', '9742750197', 0, '', '2023-02-16 17:29:00.746837', '2023-02-16 17:29:00.746837', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('475f93552e9d016156', 'suman das', '8972253507', 0, '', '2023-02-16 20:53:24.194685', '2023-02-16 20:53:24.194685', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('71d603479347637603', 'devashsih', NULL, 0, '', '2023-02-17 10:02:08.914098', '2023-02-17 10:02:08.914098', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e8ae4a22ecd4a2e298', 'hari das', NULL, 0, '', '2023-02-17 13:35:29.207610', '2023-02-17 13:35:29.207610', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9122896bef100f5e35', 'i p l', NULL, 0, '', '2023-02-17 17:30:18.303986', '2023-02-17 17:30:18.303986', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5676a86d4327aba0e5', 's k muzam', NULL, 0, '', '2023-02-17 18:22:02.511509', '2023-02-17 18:22:02.511509', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d767d612b31701dd91', 'tarun kundu', NULL, 0, '', '2023-02-17 18:34:37.012763', '2023-02-17 18:34:37.012763', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('39232e1d825ef42a06', 'goutham roy', NULL, 0, '', '2023-02-17 20:44:51.696158', '2023-02-17 20:44:51.696158', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fe285c18cf0f23e22e', 'samad malik', '8123644258', 0, '', '2023-02-18 11:17:51.182608', '2023-02-18 11:17:51.182608', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e21aeac10cca367475', 'monish jewellers', NULL, 0, '', '2023-02-18 19:02:00.434037', '2023-02-18 19:02:00.434037', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7c22223e0c3d8fced4', 'sridhar', NULL, 0, '', '2023-02-18 19:49:48.003399', '2023-02-18 19:49:48.003399', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('780fe7f0cf0e47dee5', 'bolanath', NULL, 0, '', '2023-02-18 21:07:43.062195', '2023-02-18 21:07:43.062195', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('289463b701bf037743', 'seena', NULL, 0, '', '2023-02-18 21:08:42.920419', '2023-02-18 21:08:42.920419', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1724413721cd70b9f5', 'shanthanu', NULL, 0, '', '2023-02-19 12:09:38.663294', '2023-02-19 12:09:38.663294', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('50eec07e5caeaa05ee', 'aslam', NULL, 0, '', '2023-02-19 13:18:39.128244', '2023-02-19 13:18:39.128244', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa507134e1e16987bb', 'sanuyaj mandal', '7829891776', 0, '', '2023-02-20 13:13:19.257150', '2023-02-20 13:13:19.257150', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3d52ccadd5d26b61ac', 'dharmendra', NULL, 0, '', '2023-02-20 16:48:34.207873', '2023-02-20 16:48:34.207873', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c3ec65c50057623d6f', 'kamal das', NULL, 0, '', '2023-02-20 18:47:28.023042', '2023-02-20 18:47:28.023042', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4b4a6b4fed6c0deead', 'syed', NULL, 0, '', '2023-02-21 15:25:54.312346', '2023-02-21 15:25:54.312346', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('06352e60926ca50812', '60 jewellers', NULL, 0, '', '2023-02-21 17:06:56.888954', '2023-02-21 17:06:56.888954', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3f16c8ed03e5312fe1', 'pronab pore', NULL, 0, '', '2023-02-21 18:49:11.221681', '2023-02-21 18:49:11.221681', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4d396bbb099b9cea56', 'hriday gosh', NULL, 0, '', '2023-02-22 11:18:39.938605', '2023-02-22 11:18:39.938605', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1c3c987375e1e86f58', 'nagesh (s n j)', NULL, 0, '', '2023-02-22 11:39:21.056050', '2023-02-22 11:39:21.056050', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa699ccb7472d77724', 'polash barik', NULL, 0, '', '2023-02-22 12:16:00.620177', '2023-02-22 12:16:00.620177', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fc5b04a86e79138d6f', 'tanay', NULL, 0, '', '2023-02-22 12:20:30.033640', '2023-02-22 12:20:30.033640', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('33a5d86cf13f562548', 'faruk da', NULL, 0, '', '2023-02-22 12:46:58.114198', '2023-02-22 12:46:58.114198', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c25fd75c3eb22a029', 'sajal', NULL, 0, '', '2023-02-22 13:06:11.906467', '2023-02-22 13:06:11.906467', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c16918e0b88c93cbd4', 'd k r', NULL, 0, '', '2023-02-22 17:23:25.830138', '2023-02-22 17:23:25.830138', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ef65ba0b8b1bc3e003', 'pintu rong', NULL, 0, '', '2023-02-22 19:45:24.635463', '2023-02-22 19:45:24.635463', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3d4d8f50278a1a814a', 'armugam', NULL, 0, '', '2023-02-23 19:46:18.288815', '2023-02-23 19:46:18.288815', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9336367a6b009f113e', 'bijay soni', NULL, 0, '', '2023-02-24 20:01:43.058604', '2023-02-24 20:01:43.058604', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('80f70a44ce5a4164f9', 'dhananjai pal', NULL, 0, '', '2023-02-25 13:50:40.612675', '2023-02-25 13:50:40.612675', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f027d67a251fd4a463', 'tushar', NULL, 0, '', '2023-02-25 14:43:49.061168', '2023-02-25 14:43:49.061168', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0e58615ab26ff4edb4', 'sachiin', NULL, 0, '', '2023-02-25 16:05:36.443192', '2023-02-25 16:05:36.443192', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8550e72ca108f76013', 'venkatesh', NULL, 0, '', '2023-02-26 12:00:05.234605', '2023-02-26 12:00:05.234605', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a00d08c5039ad218f4', 'hemalatha', NULL, 0, '', '2023-02-26 12:22:24.486545', '2023-02-26 12:22:24.486545', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1b2319faac3e16f2e9', 'madan bhai', NULL, 0, '', '2023-02-27 12:03:26.646397', '2023-02-27 12:03:26.646397', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2dcb4989cad8d1e252', 'raju koley', '8861491878', 0, '', '2023-02-27 13:19:35.666042', '2023-02-27 13:19:35.666042', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('101f371641ae4e53bf', 'anup khara', '6297964974', 0, '', '2023-02-27 14:14:54.334328', '2023-02-27 14:14:54.334328', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5944d267ed4c92e96b', 'p b t', NULL, 0, '', '2023-02-27 17:23:50.459976', '2023-02-27 17:23:50.459976', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ac8cd16df51414c33', 'debu samantho', NULL, 0, '', '2023-02-27 17:24:49.741479', '2023-02-27 17:24:49.741479', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7f030526ba33e7410e', 'pradeep karmakar', NULL, 0, '', '2023-02-27 18:14:28.413136', '2023-02-27 18:14:28.413136', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3a786f8a0d91fc834c', 'bilas sawantho', '9930945338', 0, '', '2023-02-27 19:27:02.641710', '2023-02-27 19:27:02.641710', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d9b2c9407fea8c3e68', 'rajeshwari', NULL, 0, '', '2023-02-27 21:30:40.351876', '2023-02-27 21:30:40.351876', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60e0183077b9579e25', 'veras bhai', NULL, 0, '', '2023-03-01 18:15:53.758820', '2023-03-01 18:15:53.758820', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8ca82197f922c36ab6', 'rangnath', NULL, 0, '', '2023-03-01 19:34:23.251118', '2023-03-01 19:34:23.251118', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e61245110af14d04ac', 'desair creation', NULL, 0, '', '2023-03-01 20:17:11.420117', '2023-03-01 20:17:11.420117', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b65760fa1a05ce3cb7', 'desire creation', NULL, 0, '', '2023-03-01 20:18:36.773577', '2023-03-01 20:18:36.773577', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f260e72c6c8504c2fa', 'sujeev', NULL, 0, '', '2023-03-02 13:41:13.958067', '2023-03-02 13:41:13.958067', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('846f65a9e359ffdfa5', 'mansur ali', NULL, 0, '', '2023-03-02 18:41:13.951341', '2023-03-02 18:41:13.951341', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ce5ed0c7b84d5ff592', 'sohail', NULL, 0, '', '2023-03-02 19:32:13.980834', '2023-03-02 19:32:13.980834', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('30041756ffb9b0bc41', 'lata', NULL, 0, '', '2023-03-02 20:46:27.826233', '2023-03-02 20:46:27.826233', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ffe508e25be2632a9d', 'rajesh debnath', '9144316232', 0, '', '2023-03-03 12:21:56.394372', '2023-03-03 12:21:56.394372', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2918292bf64d2dec9d', 'umesh anna', NULL, 0, '', '2023-03-03 14:38:24.970405', '2023-03-03 14:38:24.970405', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fa5791aadd8e181013', 'mahendar', NULL, 0, '', '2023-03-03 16:57:57.828124', '2023-03-03 16:57:57.828124', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('63e53a301bafdb46c4', 'hrk', NULL, 0, '', '2023-03-03 19:49:10.485771', '2023-03-03 19:49:10.485771', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9017c8d86bae1af965', 'jayanth adikari', NULL, 0, '', '2023-03-03 21:44:35.066704', '2023-03-03 21:44:35.066704', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1b447f87046caac340', 'sks', NULL, 0, '', '2023-03-04 12:35:08.901670', '2023-03-04 12:35:08.901670', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('23c3e3b11f12fc5805', 'saikath', NULL, 0, '', '2023-03-04 17:20:47.041984', '2023-03-04 17:20:47.041984', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('18eaa8a776fdfa93a5', 'mohini', NULL, 0, '', '2023-03-04 18:13:10.013245', '2023-03-04 18:13:10.013245', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d38699c261413a14d', 'ranjeet dhara', NULL, 0, '', '2023-03-04 19:52:38.489183', '2023-03-04 19:52:38.489183', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('06716e67bd447d9e07', 's s j w', NULL, 0, '', '2023-03-04 21:25:56.401601', '2023-03-04 21:25:56.401601', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2769a4f82f29097b96', 'mr v srinivas', NULL, 0, '', '2023-03-06 11:17:55.303359', '2023-03-06 11:17:55.303359', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d037022b191e6b9fb1', 'sanjeev pandit', NULL, 0, '', '2023-03-06 11:18:36.721505', '2023-03-06 11:18:36.721505', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1187288ede9b935b55', 'rs', NULL, 0, '', '2023-03-06 11:25:43.778084', '2023-03-06 11:25:43.778084', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a0458bc066ffb6c59c', 'sukunya', NULL, 0, '', '2023-03-06 11:48:30.764163', '2023-03-06 11:48:30.764163', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d8f714c7e70a25e73', 'abhijeet muktha', NULL, 0, '', '2023-03-06 12:05:20.582888', '2023-03-06 12:05:20.582888', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c893df9b000b95bcc0', 'bhagya shree', NULL, 0, '', '2023-03-06 13:32:43.450469', '2023-03-06 13:32:43.450469', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fbdae829df0b725dd8', 'vishal', NULL, 0, '', '2023-03-06 14:17:09.672858', '2023-03-06 14:17:09.672858', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3ddf8b5e2b9e9aa9ea', 'guru padha', NULL, 0, '', '2023-03-06 15:04:09.668023', '2023-03-06 15:04:09.668023', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('29cdd2605e3df4bad0', 'dharmen doliye', NULL, 0, '', '2023-03-06 16:45:47.455843', '2023-03-06 16:45:47.455843', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37ff603522d4ae7abb', 'gourang karmakarr', '7204712768', 0, '', '2023-03-06 16:48:41.470682', '2023-03-06 16:48:41.470682', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cc26105762ac6e8bea', 'samuel mestri', NULL, 0, '', '2023-03-06 17:03:08.569301', '2023-03-06 17:03:08.569301', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bf041dd931e7417e99', 'jinesh', NULL, 0, '', '2023-03-06 18:03:28.913664', '2023-03-06 18:03:28.913664', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa5d076caa70011024', 'nitai', NULL, 0, '', '2023-03-06 18:31:18.648893', '2023-03-06 18:31:18.648893', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a094d7b399fb3316a5', 'sk sukumar', NULL, 0, '', '2023-03-06 21:12:52.077566', '2023-03-06 21:12:52.077566', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('161d18dc7af457d18f', 'muktha', NULL, 0, '', '2023-03-07 13:32:22.353818', '2023-03-07 13:32:22.353818', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6053e40680b3423da3', 's k billal', NULL, 0, '', '2023-03-08 09:52:12.989736', '2023-03-08 09:52:12.989736', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('015cb57e3d5184ed1d', 'm s', NULL, 0, '', '2023-03-08 18:20:08.929564', '2023-03-08 18:20:08.929564', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0f018850a8ca9fdb4c', 'anshul', NULL, 0, '', '2023-03-08 20:57:47.418481', '2023-03-08 20:57:47.418481', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6e1a71e9c092c24d47', 'samar maithi', NULL, 0, '', '2023-03-09 11:01:47.391604', '2023-03-09 11:01:47.391604', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('373ddc0d312e076e07', 'maj', NULL, 0, '', '2023-03-09 12:40:31.578029', '2023-03-09 12:40:31.578029', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2597542e6acac0d712', 'sahir', NULL, 0, '', '2023-03-09 16:41:03.585957', '2023-03-09 16:41:03.585957', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fd6467abd510923032', 'muktho', NULL, 0, '', '2023-03-09 18:49:03.254911', '2023-03-09 18:49:03.254911', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9cda90b26d6d7cd05c', 'b m j rinku', NULL, 0, '', '2023-03-10 12:10:51.450292', '2023-03-10 12:10:51.450292', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('20947cf69885279941', 'popaye', NULL, 0, '', '2023-03-10 13:21:24.475041', '2023-03-10 13:21:24.475041', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1f00b37e72f173eca8', 'amul santra', NULL, 0, '', '2023-03-10 13:47:55.178971', '2023-03-10 13:47:55.178971', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9cac9e1990c5135ac9', 'sanjay baur', NULL, 0, '', '2023-03-10 13:59:12.715407', '2023-03-10 13:59:12.715407', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1ff034258bba890990', 'sushil lkumar', NULL, 0, '', '2023-03-10 17:44:35.752310', '2023-03-10 17:44:35.752310', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('55c8a03e2914625b39', 'basa', NULL, 0, '', '2023-03-11 10:55:18.595961', '2023-03-11 10:55:18.595961', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6052f5e8ee0a0362c3', 'surrender ghara', NULL, 0, '', '2023-03-11 11:36:34.663041', '2023-03-11 11:36:34.663041', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ee335cdf434f6b3005', 'subdenu ghara', NULL, 0, '', '2023-03-11 11:36:49.242802', '2023-03-11 11:36:49.242802', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cb1c80dafcae39ade9', 'sumit das', NULL, 0, '', '2023-03-11 13:26:08.926718', '2023-03-11 13:26:08.926718', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60a41f49a690933857', 'indra', NULL, 0, '', '2023-03-11 14:20:04.260765', '2023-03-11 14:20:04.260765', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('48c87e56ed6bcb1980', 'indu ring', NULL, 0, '', '2023-03-11 14:23:46.397745', '2023-03-11 14:23:46.397745', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9312935d1056f207f2', 'indu', NULL, 0, '', '2023-03-11 14:32:59.413343', '2023-03-11 14:32:59.413343', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('78504960430af843ea', 'kalpana bangles', NULL, 0, '', '2023-03-11 14:37:23.726414', '2023-03-11 14:37:23.726414', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c6dd28a839b63ecbb0', 'indu ear ring', NULL, 0, '', '2023-03-11 14:59:45.266584', '2023-03-11 14:59:45.266584', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('88bd3b55e974b3fab5', 'indu chain', NULL, 0, '', '2023-03-11 15:17:18.606621', '2023-03-11 15:17:18.606621', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('708bd323f65e496f58', 'kalpana kada', NULL, 0, '', '2023-03-11 15:24:39.508906', '2023-03-11 15:24:39.508906', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7386d54f7315749b02', 'samesh', NULL, 0, '', '2023-03-11 18:54:42.298173', '2023-03-11 18:54:42.298173', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('86f5196d24b96daa06', 'mamun s k', '8509880634', 0, '', '2023-03-11 19:25:36.607527', '2023-03-11 19:25:36.607527', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0b445a58d864c2fb74', 'jabbar', NULL, 0, '', '2023-03-11 20:22:03.726175', '2023-03-11 20:22:03.726175', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('95967a0224e306430a', 'chetan', NULL, 0, '', '2023-03-12 11:53:04.618914', '2023-03-12 11:53:04.618914', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4f4b73c496458adc8f', 'prashantho', NULL, 0, '', '2023-03-12 12:02:24.654427', '2023-03-12 12:02:24.654427', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('874480d4e3ef0ba238', 'anan', NULL, 0, '', '2023-03-13 13:51:48.195897', '2023-03-13 13:51:48.195897', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cf461538632f4f4636', 's k alam', NULL, 0, '', '2023-03-13 18:50:02.734556', '2023-03-13 18:50:02.734556', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('713ace31941ea0c581', 'subodeeep', NULL, 0, '', '2023-03-13 20:23:09.930320', '2023-03-13 20:23:09.930320', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a2c7d9f3fd5ea2c6d8', 'sahed', NULL, 0, '', '2023-03-13 20:47:23.586703', '2023-03-13 20:47:23.586703', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('138aa78eb952ebbf23', 'subhojeet saw', NULL, 0, '', '2023-03-14 11:40:31.604321', '2023-03-14 11:40:31.604321', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('761d60ce9e7dcd6a06', 'mr shankar', NULL, 0, '', '2023-03-14 11:44:44.555197', '2023-03-14 11:44:44.555197', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0f2dd1931fa68289d5', 'pavitra', NULL, 0, '', '2023-03-14 11:48:46.921392', '2023-03-14 11:48:46.921392', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6b9abcbe7a4539e8b0', 'sk saifudin', NULL, 0, '', '2023-03-14 13:35:30.777332', '2023-03-14 13:35:30.777332', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5dd0a53d2a4ec8ba7c', 'milan sawanth', NULL, 0, '', '2023-03-14 13:39:10.307829', '2023-03-14 13:39:10.307829', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('782376b1c3be285f7c', 'venu', NULL, 0, '', '2023-03-14 18:02:40.774902', '2023-03-14 18:02:40.774902', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eb97f48c3f821e0f13', 'nithai', NULL, 0, '', '2023-03-14 19:37:40.318317', '2023-03-14 19:37:40.318317', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f050f7059d8ff9e8aa', 'shine', NULL, 0, '', '2023-03-14 20:29:10.532612', '2023-03-14 20:29:10.532612', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('12ec3236091803352f', 'muthu', NULL, 0, '', '2023-03-15 13:56:41.557451', '2023-03-15 13:56:41.557451', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dedc2bb71353ad54ec', 'shiekh rahim', NULL, 0, '', '2023-03-15 15:33:48.719807', '2023-03-15 15:33:48.719807', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4f5d177b6c35fef9b4', 'meeraj', NULL, 0, '', '2023-03-15 16:39:54.865651', '2023-03-15 16:39:54.865651', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c77a42b594fa780a20', 'arpan', NULL, 0, '', '2023-03-15 16:47:01.860603', '2023-03-15 16:47:01.860603', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9b2c99da3d4c787a99', 'bansi maji', NULL, 0, '', '2023-03-15 17:14:53.555733', '2023-03-15 17:14:53.555733', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6a525d8d02fbc23cf9', 'tabrez', NULL, 0, '', '2023-03-15 18:34:20.649955', '2023-03-15 18:34:20.649955', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e319fbe88b6445267b', 'asha', NULL, 0, '', '2023-03-15 18:40:11.719425', '2023-03-15 18:40:11.719425', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ba34dbc65b4ac0b675', 'asma', NULL, 0, '', '2023-03-15 18:43:14.158553', '2023-03-15 18:43:14.158553', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5a977443043b98cc3f', 'muktar SHEIKH', '7076599234', 0, '', '2023-03-15 19:56:49.658936', '2023-03-15 19:56:49.658936', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d64d6a05d65a776fa9', 'p m j', NULL, 50, '', '2023-03-16 13:54:00.132589', '2023-03-16 13:54:00.132589', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6319ce67407efbbb50', 'sakhir', NULL, 0, '', '2023-03-16 14:21:26.572154', '2023-03-16 14:21:26.572154', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('70536716b740e92f82', 'SANJEET JANA', NULL, 0, '', '2023-03-16 17:00:13.920065', '2023-03-16 17:00:13.920065', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c2f5b6b387cf7cf26', 'RAJU', NULL, 0, '', '2023-03-16 19:30:27.736460', '2023-03-16 19:30:27.736460', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ce2c23547ce6f72f62', 'manik das', NULL, 0, '', '2023-03-17 11:31:15.884325', '2023-03-17 11:31:15.884325', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('65eff85af2fea9039d', 's v j', NULL, 0, '', '2023-03-17 11:33:45.597781', '2023-03-17 11:33:45.597781', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('430a14113e618a5a40', 'samar boree', '9972697487', 0, '', '2023-03-17 12:02:57.758939', '2023-03-17 12:02:57.758939', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c49d17f9e9c2b7e180', 'sabir', NULL, 0, '', '2023-03-17 17:10:11.401039', '2023-03-17 17:10:11.401039', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('89d1f9870a6ff2d056', 'mintaj', NULL, 0, '', '2023-03-17 18:13:08.708723', '2023-03-17 18:13:08.708723', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9836c3c78b1d9a95a2', 'surya', NULL, 0, '', '2023-03-17 18:41:51.138043', '2023-03-17 18:41:51.138043', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9757bdc12b8aac6b89', 'ambica', NULL, 0, '', '2023-03-17 19:41:14.209269', '2023-03-17 19:41:14.209269', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('49ae99eab607775cca', 'a l j', NULL, 0, '', '2023-03-18 11:19:13.308872', '2023-03-18 11:19:13.308872', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f58ed42e379d014356', 'sukumar doliye', NULL, 0, '', '2023-03-18 13:10:28.678098', '2023-03-18 13:10:28.678098', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1e05813982d05754c5', 'rafiul', NULL, 0, '', '2023-03-18 14:59:23.099063', '2023-03-18 14:59:23.099063', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6f51f5461c02ab71ef', 's k arshad', NULL, 0, '', '2023-03-18 16:54:07.242467', '2023-03-18 16:54:07.242467', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3680b78680b3a5c5dc', 'shahajhan', NULL, 0, '', '2023-03-19 12:40:24.111849', '2023-03-19 12:40:24.111849', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8ab29e1dd4bbc36667', 'subhodeep', NULL, 0, '', '2023-03-19 14:16:09.295319', '2023-03-19 14:16:09.295319', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('455860d5dc346526a0', 'samarth', NULL, 0, '', '2023-03-20 12:55:39.165962', '2023-03-20 12:55:39.165962', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8933c641d206d91647', 'anishul', NULL, 0, '', '2023-03-20 13:30:47.344757', '2023-03-20 13:30:47.344757', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7fa28e046fcd1a63f6', 'shivram', NULL, 0, '', '2023-03-20 14:55:50.100714', '2023-03-20 14:55:50.100714', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('076ea655f0014b121b', 'bolanath santra', NULL, 0, '', '2023-03-20 16:56:04.483649', '2023-03-20 16:56:04.483649', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e363f126acfe60479f', 'mukthar', NULL, 30, '', '2023-03-20 21:42:25.581263', '2023-03-20 21:42:25.581263', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('67039d833a4a860076', 'arman ali', NULL, 0, '', '2023-03-21 11:07:50.660265', '2023-03-21 11:07:50.660265', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('72912b5e905ef2b1f8', 'subdendu', NULL, 0, '', '2023-03-21 12:25:18.739450', '2023-03-21 12:25:18.739450', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('40bfab8ccbcb9303af', 'm j k', NULL, 0, '', '2023-03-21 19:56:43.043526', '2023-03-21 19:56:43.043526', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ba96398fd9bc7b5c5e', 'muttu sheik', NULL, 0, '', '2023-03-21 20:07:15.583037', '2023-03-21 20:07:15.583037', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('677d939b64338d2d0a', 'abdul salim', NULL, 0, '', '2023-03-21 20:13:05.312364', '2023-03-21 20:13:05.312364', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('86330fca65ed3855f1', 'abhinav salgela', NULL, 0, '', '2023-03-21 20:37:00.709096', '2023-03-21 20:37:00.709096', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('673aa62e900f23c6ad', 'k p', NULL, 0, '', '2023-03-21 20:50:21.507481', '2023-03-21 20:50:21.507481', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e693aa656fc03c4f16', 'adi', NULL, 0, '', '2023-03-21 21:16:52.657410', '2023-03-21 21:16:52.657410', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d8bbdd9934bc798df3', 'tarun malik', NULL, 0, '', '2023-03-22 13:43:13.170175', '2023-03-22 13:43:13.170175', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ff50259c80839f016a', 'priyanka', NULL, 0, '', '2023-03-22 13:47:53.811077', '2023-03-22 13:47:53.811077', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8b99bb564086c3561a', 'majanaiya', NULL, 0, '', '2023-03-23 13:19:00.289206', '2023-03-23 13:19:00.289206', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3f98e8b6f13d2e842c', 'C J M', NULL, 0, '', '2023-03-23 13:40:03.779800', '2023-03-23 13:40:03.779800', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('90f557ab6bd662c37f', 'nj', NULL, 50, '', '2023-03-23 15:27:03.912839', '2023-03-23 15:27:03.912839', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('92549c3219e00dfb10', 'MBJ', NULL, 0, '', '2023-03-23 15:42:24.789920', '2023-03-23 15:42:24.789920', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('060169b3f41943afd9', 'haru', NULL, 0, '', '2023-03-23 17:34:35.647235', '2023-03-23 17:34:35.647235', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('780d0534fd62745f79', 'paresh', NULL, 0, '', '2023-03-24 10:23:06.481371', '2023-03-24 10:23:06.481371', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('984790894746945d04', 'RAMAN', NULL, 0, '', '2023-03-24 14:14:44.466633', '2023-03-24 14:14:44.466633', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('460be34c8bba7e9f98', 'MEENA', NULL, 0, '', '2023-03-24 14:20:32.409885', '2023-03-24 14:20:32.409885', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7792a9d563d6b40556', 'DEEP', '9148596631', 0, '', '2023-03-24 14:22:19.915497', '2023-03-24 14:22:19.915497', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ccd3ff5b66ffdb448a', 'SRI PRIYA', NULL, 0, '', '2023-03-24 14:32:23.156235', '2023-03-24 14:32:23.156235', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('82afdc5141f98ef7f0', 'SHANTHI JEWELLERS', NULL, 0, '', '2023-03-24 14:41:52.811788', '2023-03-24 14:41:52.811788', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1d29c40bb23a357025', 'RANA BHAI', NULL, 0, '', '2023-03-24 16:36:35.193196', '2023-03-24 16:36:35.193196', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c687a7ddaf58e9cba', 'arup gosh', NULL, 30, '', '2023-03-25 15:05:09.722610', '2023-03-25 15:05:09.722610', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4f344fec9299b0096a', 'anmal', NULL, 0, '', '2023-03-25 16:27:39.486573', '2023-03-25 16:27:39.486573', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('45d052c3f50ab7f082', 'raj hansa jewel', NULL, 0, '', '2023-03-27 11:14:24.045381', '2023-03-27 11:14:24.045381', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a84e500f43c0d4b111', 'AMBRESH', NULL, 0, '', '2023-03-27 15:25:50.268979', '2023-03-27 15:25:50.268979', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5e5ae8f48d4a75e716', 'SANTU BAKIRA', NULL, 0, '', '2023-03-27 17:46:03.866543', '2023-03-27 17:46:03.866543', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f604d76e31e79a0fd5', 'BASHIR', NULL, 0, '', '2023-03-28 14:22:11.311376', '2023-03-28 14:22:11.311376', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9914c29d2e3fc9cc02', 'SANUP', NULL, 0, '', '2023-03-28 14:54:11.413858', '2023-03-28 14:54:11.413858', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ed41e63fa0643ecc48', 'SHRISHTI JEWELS', NULL, 0, '', '2023-03-28 16:40:26.894835', '2023-03-28 16:40:26.894835', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e99f984f8705f2ebc6', 'jintu', NULL, 0, '', '2023-03-29 11:07:13.293489', '2023-03-29 11:07:13.293489', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6610ad5933d64f96b8', 'UTTHAM DEBNATH', NULL, 0, '', '2023-03-29 11:42:26.343704', '2023-03-29 11:42:26.343704', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a29ce98587ff24cc13', 'RATNAKAR', NULL, 0, '', '2023-03-29 13:11:44.880203', '2023-03-29 13:11:44.880203', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('35480729751967e2c8', 'sanjay das', NULL, 0, '', '2023-03-29 14:36:49.863122', '2023-03-29 14:36:49.863122', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('306810e9b7cd97e260', 'anup malik', NULL, 0, '', '2023-03-29 14:47:17.014112', '2023-03-29 14:47:17.014112', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('831695501246b88d08', 'GOPAL SHARMA', '9916950508', 0, '', '2023-03-29 15:02:24.242142', '2023-03-29 15:02:24.242142', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e5be4c076d78dcdec6', 'IQBAL HUSSAIN', NULL, 0, '', '2023-03-29 15:26:24.778735', '2023-03-29 15:26:24.778735', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b2ea4f0bfd17de9b48', 'ZAKIR', NULL, 0, '', '2023-03-29 17:52:59.166274', '2023-03-29 17:52:59.166274', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c297aa66ff784b9994', 'MAZ', NULL, 0, '', '2023-03-29 20:21:11.646948', '2023-03-29 20:21:11.646948', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ecd220f22a11053d7', 'SANJEEV HAJRA', NULL, 0, '', '2023-03-29 20:24:00.004231', '2023-03-29 20:24:00.004231', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ac17c4592c5af9fdf8', 'SONAI', NULL, 0, '', '2023-03-29 20:55:58.985530', '2023-03-29 20:55:58.985530', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3b738a110d8aa1f464', 'HARI KOUR', '7975777581', 0, '', '2023-03-30 12:55:03.189063', '2023-03-30 12:55:03.189063', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a5b80c9d20d92fac42', 'ZAMEER', NULL, 0, '', '2023-03-30 16:06:44.591514', '2023-03-30 16:06:44.591514', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a5fca04db7c50dcef5', 'S A JAIN', NULL, 0, '', '2023-03-30 16:33:33.759707', '2023-03-30 16:33:33.759707', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('359b9d670bac165dd3', 'SHAUKAT ALI', NULL, 0, '', '2023-03-30 16:44:34.879931', '2023-03-30 16:44:34.879931', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('10300b91a3fd12a88c', 'GJ', NULL, 0, '', '2023-03-30 17:21:49.244824', '2023-03-30 17:21:49.244824', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('06599c02279dbd8286', 'S K RAHIM', NULL, 0, '', '2023-03-30 17:25:56.705591', '2023-03-30 17:25:56.705591', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d2dac9b4ba6e2d0f8e', 'KOUSHIK BHAG', NULL, 0, '', '2023-03-30 17:44:32.653023', '2023-03-30 17:44:32.653023', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('63307bc56cd715a7d7', 'SUJAI JANA', NULL, 0, '', '2023-03-31 17:20:26.294522', '2023-03-31 17:20:26.294522', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('91a704d19efb6dbbbb', 'DEBO PATRA METYA', NULL, 0, '', '2023-03-31 19:06:13.120023', '2023-03-31 19:06:13.120023', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0ed32ba2a2ac56239e', 's k allam', NULL, 0, '', '2023-04-01 09:46:24.341557', '2023-04-01 09:46:24.341557', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d7e523c98b965c95ec', 'srishti j', NULL, 0, '', '2023-04-01 11:16:04.240750', '2023-04-01 11:16:04.240750', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5f00a70e29580f55af', 'kali dA', NULL, 0, '', '2023-04-01 11:31:19.899385', '2023-04-01 11:31:19.899385', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('adeeb65f58630f8bb4', 'SK ALI', NULL, 0, '', '2023-04-01 12:45:40.373591', '2023-04-01 12:45:40.373591', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('07e4d5885952579f99', 'SANATH PRAMNIK', '9066589377', 0, '', '2023-04-01 13:03:37.881131', '2023-04-01 13:03:37.881131', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('454de1f9ad98ad1ae8', 'SUNNY DEV', '9740787680', 0, '', '2023-04-01 13:35:46.075376', '2023-04-01 13:35:46.075376', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cbed76cfe035ff3d61', 'BASHYAR', NULL, 0, '', '2023-04-01 14:35:24.490793', '2023-04-01 14:35:24.490793', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('88b855e22afa8f3940', 'BABLU MANDAL', '7029068615', 0, '', '2023-04-01 15:13:49.380372', '2023-04-01 15:13:49.380372', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60fa3a156508967b41', 'AHIL', NULL, 0, '', '2023-04-01 15:22:19.086330', '2023-04-01 15:22:19.086330', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4f7b09f44aacb0fa75', 'MANJI ABHI', NULL, 0, '', '2023-04-01 15:28:25.788530', '2023-04-01 15:28:25.788530', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8df9a6058ac78c0357', 'MANJU JK', NULL, 0, '', '2023-04-01 15:29:57.054571', '2023-04-01 15:29:57.054571', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c0a88d51c95f565f5f', 'S K AZAD', NULL, 0, '', '2023-04-01 15:56:23.534558', '2023-04-01 15:56:23.534558', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8c8939f6797dd8d44c', 'DEEP MANDOL', NULL, 0, '', '2023-04-01 16:02:08.085623', '2023-04-01 16:02:08.085623', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5daef45d10347ba7cb', 'RAJU SA', NULL, 0, '', '2023-04-01 16:43:16.395788', '2023-04-01 16:43:16.395788', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('479f5c0177f4be6231', 'RAKESH JANA', NULL, 0, '', '2023-04-01 17:20:32.124485', '2023-04-01 17:20:32.124485', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37980ceb1bb125e713', 'SAURAB DAS', NULL, 0, '', '2023-04-01 18:56:48.030040', '2023-04-01 18:56:48.030040', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('93ba9eecd837291044', 'G G G', NULL, 0, '', '2023-04-01 21:29:41.885721', '2023-04-01 21:29:41.885721', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d5dbd81ea2ab0a3bba', 'SAIKATH', NULL, 0, '', '2023-04-02 11:55:59.337077', '2023-04-02 11:55:59.337077', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8679a4fb2260983a78', 'KALLIPADU BOMIK', '9880347483', 0, '9113931445', '2023-04-02 12:03:58.689486', '2023-04-02 12:03:58.689486', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1529c2fb3e404a7435', 'ranjan karmokar', NULL, 0, '', '2023-04-02 12:23:45.058132', '2023-04-02 12:23:45.058132', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b7b3353ba2971c6546', 'KURBAN', NULL, 0, '', '2023-04-02 14:14:15.465123', '2023-04-02 14:14:15.465123', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5e50c8c00d3d23752a', 'ibadat', NULL, 0, '', '2023-04-03 10:33:41.254177', '2023-04-03 10:33:41.254177', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('99b33e071938e78337', 's,k ajim', NULL, 0, '', '2023-04-03 11:37:16.814506', '2023-04-03 11:37:16.814506', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f10718e97862090e36', 'romi', NULL, 0, '', '2023-04-03 11:46:02.766050', '2023-04-03 11:46:02.766050', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ee894341609fe74ebb', 'ayapan', NULL, 0, '', '2023-04-03 11:47:06.698585', '2023-04-03 11:47:06.698585', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('13366fb23eae8b99ad', 'N S', NULL, 0, '', '2023-04-03 14:03:12.698959', '2023-04-03 14:03:12.698959', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8890a844b03259f116', 'GOPAL MALL', NULL, 0, '', '2023-04-03 14:04:15.668729', '2023-04-03 14:04:15.668729', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5450e17f29376ff378', 'piyush', NULL, 0, '', '2023-04-03 17:32:11.696149', '2023-04-03 17:32:11.696149', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5832252aeab730dbbf', 'ram bhai', NULL, 0, '', '2023-04-03 18:53:34.780845', '2023-04-03 18:53:34.780845', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b35fc0cdebf7476e89', 'PRASHANJEET DAS', '9916926673', 0, '', '2023-04-04 12:30:02.009088', '2023-04-04 12:30:02.009088', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e70c1e1d9936103fff', 'SAMEER', NULL, 0, '', '2023-04-04 13:39:22.749250', '2023-04-04 13:39:22.749250', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a3063203a0eb900b93', 'PRITHIV', NULL, 0, '', '2023-04-05 20:10:42.074635', '2023-04-05 20:10:42.074635', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6bf64ea1c896e04662', 'disha gandhi', NULL, 0, '', '2023-04-06 12:15:32.051549', '2023-04-06 12:15:32.051549', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e533038fd79d5de03d', 'p roy', NULL, 0, '', '2023-04-06 12:20:43.554170', '2023-04-06 12:20:43.554170', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4181669ed8e7b9d429', 'nithai manna', NULL, 0, '', '2023-04-06 13:05:46.373505', '2023-04-06 13:05:46.373505', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('44a2e102c8ff9e07d1', 'veerama', NULL, 0, '', '2023-04-06 15:13:44.548754', '2023-04-06 15:13:44.548754', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('238ae26cedb90f1698', 'shree  hari bohra', NULL, 0, '', '2023-04-06 16:01:20.475641', '2023-04-06 16:01:20.475641', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ed491433f4482f348', 'amol sadra', '9620191469', 0, '', '2023-04-06 16:26:19.957421', '2023-04-06 16:26:19.957421', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a138c17e33dc6facad', 'surjeet pal', NULL, 0, '', '2023-04-06 17:27:36.494785', '2023-04-06 17:27:36.494785', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4d7dbbebb91ec0e9c9', 'hassan', NULL, 0, '', '2023-04-06 19:21:45.999896', '2023-04-06 19:21:45.999896', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d62118b0243d032041', 'TINKU', NULL, 0, '', '2023-04-07 18:09:59.574142', '2023-04-07 18:09:59.574142', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a59b17f693046c44b8', 'BHAVANI JEWELLERS', NULL, 0, '', '2023-04-07 18:24:33.829741', '2023-04-07 18:24:33.829741', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5e07e6a82de1685388', 'SALU PATRA', NULL, 0, '', '2023-04-07 20:24:23.354435', '2023-04-07 20:24:23.354435', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('83011c1343f600a58d', 'nimaye maji', NULL, 0, '', '2023-04-07 21:04:27.698527', '2023-04-07 21:04:27.698527', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c0cca2d3994d8ebe68', 'SAMARTH', NULL, 0, '', '2023-04-08 11:56:28.715615', '2023-04-08 11:56:28.715615', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cdb883b62e7836f489', 'S K AZIZUL', NULL, 0, '', '2023-04-08 15:53:37.325311', '2023-04-08 15:53:37.325311', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2d4a99d902bb2202d7', 'NIZAM', NULL, 0, '', '2023-04-08 17:56:26.682730', '2023-04-08 17:56:26.682730', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fdc1b2a1ba7a53fadb', 'SOMAIN DA', NULL, 0, '', '2023-04-09 14:13:48.131966', '2023-04-09 14:13:48.131966', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7979de1a35f714dc79', 'SJ', NULL, 0, '', '2023-04-09 14:25:10.063364', '2023-04-09 14:25:10.063364', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('61cc6bdf9054ba0114', 'SATYA SANKI', '9886063245', 0, '', '2023-04-10 11:57:35.557623', '2023-04-10 11:57:35.557623', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3b34ca10ca52c63c0f', 'SOEIL', NULL, 0, '', '2023-04-10 17:58:13.070925', '2023-04-10 17:58:13.070925', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e2f55c949f829b0111', 'YUGESH', NULL, 0, '', '2023-04-10 20:19:10.774006', '2023-04-10 20:19:10.774006', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9a8d80005639b8fa18', 'ANURADHA', NULL, 0, '', '2023-04-10 20:46:22.724791', '2023-04-10 20:46:22.724791', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c6eaf15ca4ba5b4078', 'SOHRAV', NULL, 0, '', '2023-04-11 12:30:46.639540', '2023-04-11 12:30:46.639540', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('29619b06593bb20196', 'h', NULL, 0, '', '2023-04-11 13:21:09.850228', '2023-04-11 13:21:09.850228', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d6c8194cb4492a5ad5', 'suman raj bansi', NULL, 0, '', '2023-04-11 13:52:52.301452', '2023-04-11 13:52:52.301452', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6835793caf0c2325e4', 'godiye', NULL, 0, '', '2023-04-11 15:10:03.940414', '2023-04-11 15:10:03.940414', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('287c805a6b7f89c2d6', 'babu malik', NULL, 0, '', '2023-04-11 15:51:43.862103', '2023-04-11 15:51:43.862103', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5162515000e9486cf5', 'peter', NULL, 0, '', '2023-04-11 18:25:10.521183', '2023-04-11 18:25:10.521183', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('96cff02d5b246e737a', 'tapas mondal', NULL, 0, '', '2023-04-11 21:20:58.562497', '2023-04-11 21:20:58.562497', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cc6156df81bc47f04b', 'BASU DEV JANU', NULL, 0, '', '2023-04-12 14:30:27.344325', '2023-04-12 14:30:27.344325', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b8e1f9b9680fa82c95', 'SUSHANTH BERA', NULL, 0, '', '2023-04-12 18:13:05.498110', '2023-04-12 18:13:05.498110', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c96971bdf3175e80d1', 'NEELKANTH GOLD & DIAMONDS PVT LTD', NULL, 100, '', '2023-04-12 19:17:31.875356', '2023-04-12 19:17:31.875356', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bfe136a0b9c7ccd7b2', 'LJ', NULL, 0, '', '2023-04-12 19:28:04.092875', '2023-04-12 19:28:04.092875', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1ce2b357f6f5bee6a2', 'BUDDHO', NULL, 0, '', '2023-04-12 19:44:17.683185', '2023-04-12 19:44:17.683185', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('139bab110b0286cf97', 'MANISH', NULL, 0, '', '2023-04-13 11:06:31.683495', '2023-04-13 11:06:31.683495', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('397205644db3374987', 'DEVI', NULL, 0, '', '2023-04-13 15:14:07.455784', '2023-04-13 15:14:07.455784', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('204cbac8ec478f07f7', 'PAPPU BHAI', NULL, 0, '', '2023-04-13 15:28:49.893771', '2023-04-13 15:28:49.893771', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('40c0c52ab762cb82b4', 'TAZIM', NULL, 0, '', '2023-04-13 16:58:52.663598', '2023-04-13 16:58:52.663598', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d6edda09988dccde6d', 'BHASKAR PANJA', '8017287134', 0, '', '2023-04-13 17:19:23.195666', '2023-04-13 17:19:23.195666', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('35e1676ba81aac68bc', 'babu reddy', NULL, 0, '', '2023-04-14 10:10:45.614870', '2023-04-14 10:10:45.614870', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a67bc96501378ab4a9', 'nagaraj', NULL, 0, '', '2023-04-14 11:38:22.855282', '2023-04-14 11:38:22.855282', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2eb8ca16ef6a8e0e73', 'SK  ASHADUL', NULL, 0, '', '2023-04-14 16:33:26.581406', '2023-04-14 16:33:26.581406', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8bf81811cac4f49bf8', 'MAHA', NULL, 0, '', '2023-04-14 17:00:05.360219', '2023-04-14 17:00:05.360219', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('39b333f7b1f2e5cdaa', 'MUBARAK', NULL, 0, '', '2023-04-14 18:55:38.757124', '2023-04-14 18:55:38.757124', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0492996606ea0e783f', 'bindu', NULL, 0, '', '2023-04-15 10:02:25.352510', '2023-04-15 10:02:25.352510', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ffcb8b63fce6ab1b9', 'ASHOK', NULL, 0, '', '2023-04-15 12:07:08.633354', '2023-04-15 12:07:08.633354', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('096e549ee1fab21dac', 'PRASHANTH JANA', '9113557095', 0, '', '2023-04-15 14:26:35.586534', '2023-04-15 14:26:35.586534', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fbd2d06b64637aa2c7', 'MAS', NULL, 0, '', '2023-04-15 18:14:43.590475', '2023-04-15 18:14:43.590475', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('65c1dfc5242d5227a7', 'MAJ', NULL, 0, '', '2023-04-15 18:14:55.601552', '2023-04-15 18:14:55.601552', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('50101f21a1d690df7f', 'NASIR', NULL, 0, '', '2023-04-15 19:02:42.566033', '2023-04-15 19:02:42.566033', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('26e65eec2240ed6df2', 'RAMA CHARI', NULL, 0, '', '2023-04-15 19:07:42.419419', '2023-04-15 19:07:42.419419', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('750cdedde21f4871e0', 'NEELKANTH JEWELLERS', NULL, 250, '', '2023-04-15 19:47:43.251049', '2023-04-15 19:47:43.251049', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('188ee089e9ef80435d', 'prashanth das', NULL, 0, '', '2023-04-16 12:09:49.156144', '2023-04-16 12:09:49.156144', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c18b661436d4f2bea2', 'shokath biswas', NULL, 0, '', '2023-04-16 12:40:44.124588', '2023-04-16 12:40:44.124588', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a9e5838710c46d3033', 'TARAPADU', NULL, 0, '', '2023-04-16 13:25:52.105012', '2023-04-16 13:25:52.105012', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d7039cb906a6a3c60', 'DEEPENDU', NULL, 0, '', '2023-04-17 12:10:28.913795', '2023-04-17 12:10:28.913795', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('58ffe04907819661b6', 'MANOHAR DAS', NULL, 0, '', '2023-04-17 12:49:34.382235', '2023-04-17 12:49:34.382235', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6a2cf3f56682ec88db', 'A j', NULL, 0, '', '2023-04-17 16:18:17.296810', '2023-04-17 16:18:17.296810', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5234706432482a4d8d', 's v', NULL, 0, '', '2023-04-17 16:39:55.091283', '2023-04-17 16:39:55.091283', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0ff1a3588f14cd9980', 'ABC', NULL, 50, '', '2023-04-17 17:48:12.948443', '2023-04-17 17:48:12.948443', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dea9e499220d5b9181', 'TANMAI DAS', NULL, 0, '', '2023-04-17 19:09:11.893716', '2023-04-17 19:09:11.893716', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('34006c95f92dc78249', 'NAZARUL', NULL, 0, '', '2023-04-17 19:58:05.354042', '2023-04-17 19:58:05.354042', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c2cefb9bc0934109e1', 'NONI', NULL, 0, '', '2023-04-17 21:30:13.510813', '2023-04-17 21:30:13.510813', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0928622b2917ec9924', 'SHARMILA', NULL, 0, '', '2023-04-18 13:31:02.494296', '2023-04-18 13:31:02.494296', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d89f547b7aacf59756', 'SHEK ALI', NULL, 0, '', '2023-04-18 16:55:01.463188', '2023-04-18 16:55:01.463188', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fa232e90c1e08df6e8', 'sabudhin s k', NULL, 0, '', '2023-04-18 16:57:08.278366', '2023-04-18 16:57:08.278366', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9eadbefd4cddc84328', 'sajan mandal', NULL, 0, '', '2023-04-18 17:30:10.418120', '2023-04-18 17:30:10.418120', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3c7525d0c8f29fbca0', 'sadam', NULL, 0, '', '2023-04-18 19:31:45.748016', '2023-04-18 19:31:45.748016', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('638b8d5c7ee13a8871', 'tilak', NULL, 0, '', '2023-04-19 13:02:09.331772', '2023-04-19 13:02:09.331772', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4ba5b9c096327ad426', 'SUVARNA', NULL, 0, '', '2023-04-19 13:52:30.258886', '2023-04-19 13:52:30.258886', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2ceccf3c370ead7a9b', 'SUDEEP DAS', NULL, 0, '', '2023-04-19 14:48:22.127810', '2023-04-19 14:48:22.127810', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e4a10b89fc34db6b8e', 'PASHA', NULL, 0, '', '2023-04-19 15:00:41.048846', '2023-04-19 15:00:41.048846', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a15dee6656f7c5c270', 'CHANDI MAITHI', NULL, 0, '', '2023-04-19 16:21:06.042869', '2023-04-19 16:21:06.042869', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1a8e1256105ea69503', 'manas sawantho', '9108354463', 0, '', '2023-04-20 10:07:53.368225', '2023-04-20 10:07:53.368225', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('022d9ad17527912040', 'shashadhar santra', NULL, 0, '', '2023-04-20 11:44:26.970531', '2023-04-20 11:44:26.970531', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('35b3dbb432317e9a88', 'MANYA JEWELS', NULL, 0, '', '2023-04-20 12:28:38.035212', '2023-04-20 12:28:38.035212', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('41940221c9dd79f299', 'RADHEY GOVINDA', NULL, 0, '', '2023-04-20 12:44:30.402882', '2023-04-20 12:44:30.402882', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('87eca925f08eaf764c', 'MANSA MAITHYE', '7384831859', 0, '', '2023-04-20 15:07:37.908676', '2023-04-20 15:07:37.908676', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a471825bff629c7b06', 'S K ALI', NULL, 0, '', '2023-04-20 15:39:58.263869', '2023-04-20 15:39:58.263869', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a72190295fe4d49688', 'GANGARAM', NULL, 0, '', '2023-04-20 19:31:40.326427', '2023-04-20 19:31:40.326427', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bb6d789bac3009325c', 'gopal jana', NULL, 0, '', '2023-04-21 13:09:57.407783', '2023-04-21 13:09:57.407783', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f0087be0477630f8d0', 'RAHUL SONI', NULL, 0, '', '2023-04-21 14:48:52.995476', '2023-04-21 14:48:52.995476', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('037de75f931a6375a0', 'chopra', NULL, 100, '', '2023-04-21 15:34:06.133291', '2023-04-21 15:34:06.133291', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2ad563b0a9b4acf20a', 'DAVID', NULL, 0, '', '2023-04-21 17:37:48.241688', '2023-04-21 17:37:48.241688', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('34c000351fec3a0012', 'M J K', NULL, 0, '', '2023-04-21 18:59:45.129069', '2023-04-21 18:59:45.129069', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4b82102eeda1d8f8b1', 'SAIFUL', NULL, 0, '', '2023-04-21 19:20:38.315294', '2023-04-21 19:20:38.315294', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2f7949b5969df71772', 'S P D', NULL, 0, '', '2023-04-21 19:27:38.624412', '2023-04-21 19:27:38.624412', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c3ed611b7ec91a3d0d', 'SHANTHI JEWELS', NULL, 0, '', '2023-04-21 19:33:36.499993', '2023-04-21 19:33:36.499993', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('39ba962f07a41a25ad', 'MONISS JEWEL', NULL, 0, '', '2023-04-22 13:46:26.319041', '2023-04-22 13:46:26.319041', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('efb7fb6e9dbc118c78', 'ARMUGHAM', NULL, 0, '', '2023-04-22 19:45:15.235087', '2023-04-22 19:45:15.235087', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a945d1e5ac6af30682', 'MERRY', NULL, 0, '', '2023-04-23 11:28:07.617863', '2023-04-23 11:28:07.617863', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6724463137db01430a', 'SHASHI KUMAR', NULL, 0, '', '2023-04-23 13:07:06.247855', '2023-04-23 13:07:06.247855', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('57189d0b2f9e1b1eb8', 'HJR', NULL, 0, '', '2023-04-23 13:37:54.335157', '2023-04-23 13:37:54.335157', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('edf31734bbb7add563', 'MUNNIR', NULL, 0, '', '2023-04-24 11:43:20.434448', '2023-04-24 11:43:20.434448', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cadfad6a8beea8c89f', 'RANJITH SAWANTHO', NULL, 0, '', '2023-04-24 12:55:09.463157', '2023-04-24 12:55:09.463157', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0583fca3f7862f4fcf', 'ARIF', NULL, 0, '', '2023-04-24 14:07:21.026415', '2023-04-24 14:07:21.026415', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b6b10ea9cb75e30e41', 'NITHAI DIGAR', NULL, 0, '', '2023-04-24 19:38:27.429494', '2023-04-24 19:38:27.429494', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b523bb95f359dfdbeb', 'sujay das', NULL, 0, '', '2023-04-25 16:19:18.271747', '2023-04-25 16:19:18.271747', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7d0321aec50d45faba', 'soyov sheikh', NULL, 0, '', '2023-04-25 18:46:07.039181', '2023-04-25 18:46:07.039181', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d88e8b118951a1a9d4', 'shekar dhara', NULL, 0, '', '2023-04-25 21:07:33.929444', '2023-04-25 21:07:33.929444', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5106364b2553e696a3', 'tejaswi', NULL, 0, '', '2023-04-25 21:13:05.474903', '2023-04-25 21:13:05.474903', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0407499ea77084fff4', 'kisnandu', NULL, 0, '', '2023-04-26 10:43:10.063586', '2023-04-26 10:43:10.063586', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8b813e1ecec6c933d5', 'GOUTHAM', NULL, 0, '', '2023-04-26 11:58:35.008401', '2023-04-26 11:58:35.008401', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('352888f080315f3b59', 'MOTILAL', NULL, 0, '', '2023-04-26 13:23:43.896554', '2023-04-26 13:23:43.896554', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bec6aa6a9bc6b1453d', 'PRASHANTH GHATI', '9113500709', 0, '', '2023-04-26 14:55:50.272089', '2023-04-26 14:55:50.272089', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('38824558ad4d9008be', 'sushantho patra', NULL, 0, '', '2023-04-26 18:00:58.048277', '2023-04-26 18:00:58.048277', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4252e74b807d7453f5', 'SANJAY SAREN', '7019295582', 0, '', '2023-04-27 15:46:09.781116', '2023-04-27 15:46:09.781116', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('827f414171ef378ff2', 'BISWAJEET MISRA', NULL, 0, '', '2023-04-27 16:36:56.256781', '2023-04-27 16:36:56.256781', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('68ba993ee6759c750a', 'MANOJ K N', NULL, 0, '', '2023-04-27 20:57:57.500635', '2023-04-27 20:57:57.500635', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4ac63904ef52432236', 'GOPAL PAL', NULL, 0, '', '2023-04-28 11:00:12.958678', '2023-04-28 11:00:12.958678', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('59f75b74bd99641d74', 'NITHAYANAND MAJI', NULL, 0, '', '2023-04-28 13:07:19.493264', '2023-04-28 13:07:19.493264', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0b37d56287d7f10aa9', 'KIRAN', NULL, 0, '', '2023-04-28 17:14:08.479046', '2023-04-28 17:14:08.479046', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2d11892ce274fc7951', 'RAMESH PAL', '9035342753', 0, '', '2023-04-28 20:17:06.058702', '2023-04-28 20:17:06.058702', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8910c11f6267d7c3b4', 'arvinda duliya', NULL, 0, '', '2023-04-29 15:19:44.919932', '2023-04-29 15:19:44.919932', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f05c0abd1a836990ad', 's b j', NULL, 0, '', '2023-04-29 15:24:52.480840', '2023-04-29 15:24:52.480840', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('017971c1577eac3a8b', 'sheikh abdur', NULL, 0, '', '2023-04-29 17:32:20.221854', '2023-04-29 17:32:20.221854', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5bf0293736df16d0dd', 'shek abdulla', NULL, 0, '', '2023-04-29 20:16:36.096237', '2023-04-29 20:16:36.096237', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32c0556637efb5e846', 'sudhir kumar', NULL, 0, '', '2023-04-29 21:31:36.254004', '2023-04-29 21:31:36.254004', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c653c4b763107446b', 'BISWAJEET MISHRA', NULL, 0, '', '2023-04-30 11:00:57.565062', '2023-04-30 11:00:57.565062', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('523f1bfe73944452e7', 'kalyan', NULL, 0, '', '2023-05-01 11:49:43.241095', '2023-05-01 11:49:43.241095', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea3c8887df89043f06', 'bishu', NULL, 0, '', '2023-05-01 11:50:45.342899', '2023-05-01 11:50:45.342899', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b71b6eb5863e5e462a', 'SIJU', NULL, 0, '', '2023-05-01 12:59:09.445896', '2023-05-01 12:59:09.445896', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eee9351cc007b44244', 'anup mondal', NULL, 0, '', '2023-05-02 13:09:40.771629', '2023-05-02 13:09:40.771629', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ce001c8e6f5ec4647b', 'MUSTAFA', NULL, 0, '', '2023-05-02 16:08:17.346672', '2023-05-02 16:08:17.346672', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fe68ed0e12c9f6b7d5', 'MR SUSHANTH DAY', NULL, 0, '', '2023-05-02 16:40:41.785917', '2023-05-02 16:40:41.785917', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9c08489b9bb915cd92', 'SRIMANTH', NULL, 0, '', '2023-05-02 17:32:16.586008', '2023-05-02 17:32:16.586008', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('21a6a1706b0b461ca7', 'NP', NULL, 0, '', '2023-05-02 17:38:33.149029', '2023-05-02 17:38:33.149029', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c7a9fbca50f9098292', 'SANJAY SANTRA', NULL, 0, '', '2023-05-02 20:47:04.232617', '2023-05-02 20:47:04.232617', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3022661a32d0d6347f', 'NAGAR', NULL, 0, '', '2023-05-02 21:26:07.785056', '2023-05-02 21:26:07.785056', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fb3bd858adcafba081', 'SRIVAS', NULL, 0, '', '2023-05-03 12:28:53.130893', '2023-05-03 12:28:53.130893', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e1b81073278f3bd0d2', 'ANMOL KHATRI', NULL, 0, '', '2023-05-03 12:42:43.059032', '2023-05-03 12:42:43.059032', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('08fe4811b12b4add73', 'NAM', NULL, 0, '', '2023-05-03 18:12:32.739581', '2023-05-03 18:12:32.739581', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ee3feeefd487439e7e', 'pradeep singh', NULL, 0, '', '2023-05-03 19:07:04.872638', '2023-05-03 19:07:04.872638', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a2903596355544a0b8', 'NANDU PRAMANIK', NULL, 0, '', '2023-05-04 15:48:42.658916', '2023-05-04 15:48:42.658916', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('95bdcb485cd2e3bab0', 'SOHIL', NULL, 0, '', '2023-05-04 17:09:09.524147', '2023-05-04 17:09:09.524147', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a678b0f874a1a67976', 'L J', NULL, 0, '', '2023-05-04 20:46:42.862081', '2023-05-04 20:46:42.862081', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5be3af94a14a2ded5b', 'kalpesh', NULL, 0, '', '2023-05-05 13:21:45.431710', '2023-05-05 13:21:45.431710', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c1002aad8014a6d011', 'skj', NULL, 0, '', '2023-05-05 14:25:19.607273', '2023-05-05 14:25:19.607273', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('255e413aae53bb064b', 'BAN MALIK', NULL, 0, '', '2023-05-06 12:28:24.452204', '2023-05-06 12:28:24.452204', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6afa9ad183a6d26eeb', 'ABHIJEET SAWANTH', NULL, 0, '', '2023-05-06 13:02:43.093717', '2023-05-06 13:02:43.093717', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ecb91d92f5631e9dfd', 'SIOEN', NULL, 0, '', '2023-05-06 15:48:35.469030', '2023-05-06 15:48:35.469030', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('55d27275d8f1b67763', 'SHEETAL', NULL, 0, '', '2023-05-06 17:00:53.428912', '2023-05-06 17:00:53.428912', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('88bcde1b390b6d0c0f', 'MANJARUL', NULL, 0, '', '2023-05-06 18:29:11.576332', '2023-05-06 18:29:11.576332', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8c792ca590a56feec3', 'S M S', NULL, 0, '', '2023-05-06 20:01:12.317146', '2023-05-06 20:01:12.317146', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b72921b3512168d1ee', 's r j v', NULL, 0, '', '2023-05-07 13:39:05.160808', '2023-05-07 13:39:05.160808', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e27b5006219ec62bbc', 'biswajeet choudri', NULL, 0, '', '2023-05-08 10:52:11.115391', '2023-05-08 10:52:11.115391', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4606bd07f1c464a535', 'chandrakanth kole', '9886131977', 0, '8147098440', '2023-05-08 11:21:30.574942', '2023-05-08 11:21:30.574942', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('750a11bda46dd5f103', 'VIKRAM', NULL, 0, '', '2023-05-08 12:31:45.422991', '2023-05-08 12:31:45.422991', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('48ddaf566291b861d3', 'MOHAMAD AKRAM', NULL, 0, '', '2023-05-08 14:06:31.858841', '2023-05-08 14:06:31.858841', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9e4951a39bb849a9ce', 'ABHINANDHAN', NULL, 0, '', '2023-05-08 21:15:26.532174', '2023-05-08 21:15:26.532174', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('be1475750ab7f4aab2', 'ASHIQ', NULL, 0, '', '2023-05-09 15:44:36.814873', '2023-05-09 15:44:36.814873', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6f33c748809ccdbfea', 'LAKHAN', NULL, 0, '', '2023-05-09 17:21:51.579628', '2023-05-09 17:21:51.579628', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8dcf035427c4b23cec', 'MINSARUL', NULL, 0, '', '2023-05-09 18:50:49.967132', '2023-05-09 18:50:49.967132', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('10773d9741445f7374', 'kallipadu manna', NULL, 0, '', '2023-05-10 11:47:15.527816', '2023-05-10 11:47:15.527816', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dfbdade749f950e4ec', 'praveenji', NULL, 0, '', '2023-05-10 15:22:42.772742', '2023-05-10 15:22:42.772742', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c2e1b0677c53f8f39c', 'a j', NULL, 0, '', '2023-05-10 15:41:38.173767', '2023-05-10 15:41:38.173767', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0c9a74e60e3707d23c', 'praveen ji', NULL, 0, '', '2023-05-10 16:31:23.429603', '2023-05-10 16:31:23.429603', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c808b8913dcba896ef', 'MJ', NULL, 0, '', '2023-05-11 14:24:12.533124', '2023-05-11 14:24:12.533124', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d6af9fd7979f1a5e98', 'VAIBHAV', NULL, 0, '', '2023-05-11 14:59:30.205258', '2023-05-11 14:59:30.205258', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ee188717c9eca249e8', 'H J', NULL, 0, '', '2023-05-11 16:25:04.704479', '2023-05-11 16:25:04.704479', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7c4ccfe668ee3b44c1', 'RIYAJUL', NULL, 0, '', '2023-05-11 18:15:37.376606', '2023-05-11 18:15:37.376606', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3dfd9205ba4804dbb1', 'LAXMAMA', NULL, 0, '', '2023-05-11 21:08:46.881486', '2023-05-11 21:08:46.881486', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aba8fb46be2bda7cbd', 'FARQZ DA', NULL, 0, '', '2023-05-12 13:13:34.171685', '2023-05-12 13:13:34.171685', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('976e8fa244d212b532', 'ANUP SADUKA', NULL, 0, '', '2023-05-12 15:11:34.574820', '2023-05-12 15:11:34.574820', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d5b042f76fcecc16c6', 'UMESH', NULL, 0, '', '2023-05-12 16:21:18.198541', '2023-05-12 16:21:18.198541', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('43e584c4c1ea6c4207', 'santu bomik', NULL, 0, '', '2023-05-13 11:16:26.331310', '2023-05-13 11:16:26.331310', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b4b01c6481eca65f13', 'ANJANA', NULL, 0, '', '2023-05-14 12:34:41.894426', '2023-05-14 12:34:41.894426', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('860c39ed8c9289c62b', 'SATYA BAMA', NULL, 0, '', '2023-05-14 14:03:52.091046', '2023-05-14 14:03:52.091046', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('509a452fa3e3d70e3d', 'ani', NULL, 0, '', '2023-05-14 14:32:28.651719', '2023-05-14 14:32:28.651719', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f367b69cbec502a5bc', 'AZAR', NULL, 0, '', '2023-05-15 13:12:09.275687', '2023-05-15 13:12:09.275687', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa259bf1af027c4dcd', 'ANMOUL JEWELLERS', NULL, 0, '', '2023-05-15 14:37:44.049171', '2023-05-15 14:37:44.049171', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('897400b3a54f3999fe', 'AMAUO MANNA', NULL, 0, '', '2023-05-15 17:51:29.755647', '2023-05-15 17:51:29.755647', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('087f19df3c2c546b92', 'BANTU', NULL, 0, '', '2023-05-15 19:06:24.129772', '2023-05-15 19:06:24.129772', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('daa3e46e0ed14dc545', 'CHOTAN', NULL, 0, '', '2023-05-16 12:31:19.560534', '2023-05-16 12:31:19.560534', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('df20771d6dd465cb39', 'SHUBHASH', NULL, 0, '', '2023-05-16 15:09:22.486167', '2023-05-16 15:09:22.486167', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8b3e10994d512ae1d3', 'SHUBHASH BOMIK', NULL, 0, '', '2023-05-16 15:09:34.689325', '2023-05-16 15:09:34.689325', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2bdac2959d07698391', 'S K MAJARUL', NULL, 0, '', '2023-05-16 15:15:39.149074', '2023-05-16 15:15:39.149074', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('649ff888582d90dfd9', 'padam badera', NULL, 0, '', '2023-05-16 16:37:44.256318', '2023-05-16 16:37:44.256318', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60e4dd3f808e6e8e5f', 'BISWAJEET', NULL, 0, '', '2023-05-17 13:50:57.775481', '2023-05-17 13:50:57.775481', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea6829c4b4aeb795a1', 'JATIN', NULL, 0, '', '2023-05-18 11:58:27.486416', '2023-05-18 11:58:27.486416', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa3882945b25e95323', 'MR NARAYAN', NULL, 0, '', '2023-05-18 12:08:30.679764', '2023-05-18 12:08:30.679764', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('95bd5e9f9622c60323', 'prabhir mandal', NULL, 0, '', '2023-05-18 19:44:15.428693', '2023-05-18 19:44:15.428693', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bffbdd5d98703b05ad', 'SN', NULL, 0, '', '2023-05-19 11:24:50.292805', '2023-05-19 11:24:50.292805', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2e5e3e16075e8f0d9d', 'RAJA GEMS', NULL, 0, '', '2023-05-19 11:29:16.179163', '2023-05-19 11:29:16.179163', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5573bbbf599ae98662', 'DEEPIKA', NULL, 0, '', '2023-05-19 12:46:15.141273', '2023-05-19 12:46:15.141273', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8dd604c2cc749e52f3', 'KALLIPADU MANNA', NULL, 0, '', '2023-05-19 13:54:55.399252', '2023-05-19 13:54:55.399252', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9ad969c1b05ed98138', 'VARDHARAJAN', NULL, 0, '', '2023-05-19 14:22:36.287007', '2023-05-19 14:22:36.287007', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('40a592b6b640a31692', 'PINTU SINGH', NULL, 0, '', '2023-05-19 15:41:03.210334', '2023-05-19 15:41:03.210334', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0d0205d9a43ece1097', 'shohib', NULL, 0, '', '2023-05-19 17:59:21.299874', '2023-05-19 17:59:21.299874', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8917b4592d678449cb', 'binay', NULL, 0, '', '2023-05-19 20:10:29.290986', '2023-05-19 20:10:29.290986', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('410a4d805dca0bf3e1', 'shamim', NULL, 0, '', '2023-05-19 20:40:34.296256', '2023-05-19 20:40:34.296256', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('004f8ccde872b748b7', 'bhagya diamond', NULL, 0, '', '2023-05-19 20:43:44.687342', '2023-05-19 20:43:44.687342', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3864f5ab9d43d84a64', 'SHUBANKAR BHAG', NULL, 0, '', '2023-05-20 13:06:09.582910', '2023-05-20 13:06:09.582910', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d021e41c9cc46372b', 'JBJ', NULL, 0, '', '2023-05-20 15:09:45.656451', '2023-05-20 15:09:45.656451', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('72aa44327e5e7ea4ef', 'sikander', NULL, 0, '', '2023-05-20 15:24:26.337650', '2023-05-20 15:24:26.337650', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dc8ab04b5d6d61cdb5', 'lalith s n j', NULL, 0, '', '2023-05-20 19:20:24.555871', '2023-05-20 19:20:24.555871', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('29047a58fc0abca8ff', 'DEEPENDU SAWANTHO', NULL, 0, '', '2023-05-21 13:09:24.478774', '2023-05-21 13:09:24.478774', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('654a3782dead460f46', 'SNJ', NULL, 0, '', '2023-05-21 13:58:12.613539', '2023-05-21 13:58:12.613539', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3a106e78876e06cf63', 'MAHINDER', NULL, 0, '', '2023-05-22 16:54:01.604542', '2023-05-22 16:54:01.604542', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8da291db64deae6b4a', 'KARTHIK BERA', NULL, 0, '', '2023-05-23 13:40:52.711306', '2023-05-23 13:40:52.711306', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d82e6e8cfb050504e1', 'S P', NULL, 0, '', '2023-05-23 13:54:55.735505', '2023-05-23 13:54:55.735505', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b50f75646ac0dbc964', 'shivam giri', NULL, 0, '', '2023-05-23 16:18:40.134718', '2023-05-23 16:18:40.134718', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9cec98ac6cfdf083e5', 'dalim sheikh', NULL, 0, '', '2023-05-23 16:24:57.062797', '2023-05-23 16:24:57.062797', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('947580106e8769d263', 'amith das', NULL, 0, '', '2023-05-24 11:02:21.474614', '2023-05-24 11:02:21.474614', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7e9e5c66684e07812b', 'veenhaj', NULL, 0, '', '2023-05-24 12:23:02.254315', '2023-05-24 12:23:02.254315', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e3f806287febcbf87d', 'k r s', NULL, 0, '', '2023-05-24 12:50:40.048026', '2023-05-24 12:50:40.048026', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cd9eb97fcbf119d513', 'tejraj', NULL, 0, '', '2023-05-24 13:41:13.737710', '2023-05-24 13:41:13.737710', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d0043baeb497efbd55', 'izul', NULL, 0, '', '2023-05-24 16:34:51.480112', '2023-05-24 16:34:51.480112', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('566f4739431fa5571f', 'biswajeet das', '9742645047', 0, '', '2023-05-24 20:23:14.144816', '2023-05-24 20:23:14.144816', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ac1501a5682809cac5', 'MANIK PRADHAN', NULL, 0, '', '2023-05-25 16:51:17.137447', '2023-05-25 16:51:17.137447', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f82db2b53db4f85e54', 'M.J.D', NULL, 0, '', '2023-05-26 16:16:54.567235', '2023-05-26 16:16:54.567235', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4f9f011dfc008a690a', 'SUSHANTH DEY', '9019701022', 0, '', '2023-05-26 16:21:18.416748', '2023-05-26 16:21:18.416748', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('234017a073753c70ad', 'vani', NULL, 0, '', '2023-05-26 17:51:05.839436', '2023-05-26 17:51:05.839436', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d8c50e11bff717549c', 'ijul', NULL, 0, '', '2023-05-26 18:09:52.593583', '2023-05-26 18:09:52.593583', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('216fd1884ac41fef37', 'j m b', NULL, 0, '', '2023-05-26 20:04:33.800570', '2023-05-26 20:04:33.800570', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c1ffa6ab4567d3e739', 'dk', NULL, 0, '', '2023-05-26 20:53:31.213956', '2023-05-26 20:53:31.213956', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('65e9a8fcf3b04efa16', 's m j', NULL, 0, '', '2023-05-26 21:14:46.872835', '2023-05-26 21:14:46.872835', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8a4523ebe84368b8f4', 'CHAYA', NULL, 0, '', '2023-05-27 12:31:33.350237', '2023-05-27 12:31:33.350237', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8ef6fc5c61a26feb9f', 'tiger', NULL, 0, '', '2023-05-27 14:58:58.081413', '2023-05-27 14:58:58.081413', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2ddaa120112039de61', 'ratna', NULL, 0, '', '2023-05-27 17:17:22.257530', '2023-05-27 17:17:22.257530', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6413519f52b3bd7b4a', 'AB', NULL, 0, '', '2023-05-29 11:42:25.477822', '2023-05-29 11:42:25.477822', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e2b22b4e4d8c84c608', 'SURESH DAS', NULL, 0, '', '2023-05-29 12:15:14.894403', '2023-05-29 12:15:14.894403', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f661b5b708a07021b0', 'SUJAY SAWANTHO', NULL, 0, '', '2023-05-29 15:17:16.046241', '2023-05-29 15:17:16.046241', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b7339ebd89f70d96fc', 'GANESH BARIK', NULL, 0, '', '2023-05-29 15:24:16.070463', '2023-05-29 15:24:16.070463', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8a0de5d71b78a52c4a', 'SAKIR', NULL, 0, '', '2023-05-29 15:40:50.326558', '2023-05-29 15:40:50.326558', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('61fd384a147eb0addb', 'SATISH', NULL, 0, '', '2023-05-30 11:58:46.860883', '2023-05-30 11:58:46.860883', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7515162bd3db795c44', 'D K', NULL, 0, '', '2023-05-30 13:13:47.385991', '2023-05-30 13:13:47.385991', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0d1164fd08e3df6836', 'SOVAN', NULL, 0, '', '2023-05-30 13:16:35.010857', '2023-05-30 13:16:35.010857', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('81cb10993512224d2f', 'T M', NULL, 0, '', '2023-05-30 14:43:32.899977', '2023-05-30 14:43:32.899977', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('272372ac8b78652bf2', 'FARDIN', NULL, 0, '', '2023-05-30 15:56:05.703032', '2023-05-30 15:56:05.703032', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d210c507ac573d893', 'ANIRUDH', NULL, 0, '', '2023-05-30 16:05:30.101314', '2023-05-30 16:05:30.101314', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('13950930beccd1608a', 'GOPAL GADIYE', NULL, 0, '', '2023-05-30 17:39:22.489556', '2023-05-30 17:39:22.489556', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ac5e8caeb7507f9825', 'DEVNATH', NULL, 0, '', '2023-05-30 19:31:03.263751', '2023-05-30 19:31:03.263751', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('57514c13d70aed2da0', 'BIKRAM', NULL, 0, '', '2023-05-30 19:40:15.577089', '2023-05-30 19:40:15.577089', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6d3172cdaf2c42c9db', 'shek habib', '8088018526', 0, '', '2023-05-31 10:25:37.883262', '2023-05-31 10:25:37.883262', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8245bec50be945d680', 'pronab malik', NULL, 0, '', '2023-05-31 13:14:32.537267', '2023-05-31 13:14:32.537267', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cd698352f5d0851c47', 'anjan', NULL, 0, '', '2023-05-31 13:38:48.381021', '2023-05-31 13:38:48.381021', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fa3e2aa17c11fe2d7c', 'sri krishna', NULL, 0, '', '2023-05-31 14:32:05.346698', '2023-05-31 14:32:05.346698', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('802549139294be9b60', 'subha', NULL, 0, '', '2023-05-31 20:40:08.600019', '2023-05-31 20:40:08.600019', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dc425cd9b55d191702', 'SHANKAR BOMIK', NULL, 0, '', '2023-06-01 12:33:58.146492', '2023-06-01 12:33:58.146492', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('775b9e90fd66168e4d', 'SUJEET', NULL, 0, '', '2023-06-01 12:56:10.244772', '2023-06-01 12:56:10.244772', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1432e96e0f843f942d', 'SUKANTU', NULL, 0, '', '2023-06-01 14:50:35.419990', '2023-06-01 14:50:35.419990', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d2534752d31203f03', 'SISIR DADA', '8089214500', 0, '', '2023-06-01 16:15:30.770107', '2023-06-01 16:15:30.770107', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5490dd3d95a7c96134', 'S A J', NULL, 0, '', '2023-06-01 16:16:41.057205', '2023-06-01 16:16:41.057205', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9429cd576beca31f60', 'GJN', NULL, 0, '', '2023-06-01 17:47:39.998132', '2023-06-01 17:47:39.998132', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f831957c6c81ddf5f1', 'MAMU', NULL, 0, '', '2023-06-01 17:49:57.540215', '2023-06-01 17:49:57.540215', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9c2a5310ae705c8a41', 'GOUTHAMN BAVDHI', '6294277259', 0, '', '2023-06-01 18:10:25.478848', '2023-06-01 18:10:25.478848', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ef27440f1022f9204b', 'GOUTHAM BAVDI', NULL, 0, '', '2023-06-01 18:10:51.229056', '2023-06-01 18:10:51.229056', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e11657739fceb82d4b', 'CHANDHAN NAR', NULL, 0, '', '2023-06-01 19:15:44.863840', '2023-06-01 19:15:44.863840', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3f8a89491c4f051798', 'nitai sasmal', NULL, 0, '', '2023-06-01 20:52:24.765249', '2023-06-01 20:52:24.765249', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9068cdd1b3fc52a4ac', 'SHEIKH ALI', '8583812282', 0, '', '2023-06-02 10:59:17.625983', '2023-06-02 10:59:17.625983', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e765b19ce8562c03b1', 'SURJEET', NULL, 0, '', '2023-06-02 16:41:55.138449', '2023-06-02 16:41:55.138449', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d164ccb829d3ef1beb', 'kamala', NULL, 0, '', '2023-06-03 16:29:35.630396', '2023-06-03 16:29:35.630396', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37f549e523340302df', 'TAMIM', NULL, 0, '', '2023-06-03 20:19:49.795365', '2023-06-03 20:19:49.795365', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('036bc62db7a691cda6', 'PAPPU', NULL, 0, '', '2023-06-04 10:50:04.130948', '2023-06-04 10:50:04.130948', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8a167dd5ffcda0669e', 'S M A J', NULL, 0, '', '2023-06-05 13:19:29.199692', '2023-06-05 13:19:29.199692', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8c574c4ccefd92ed7c', 'PRADEEP DAS', NULL, 0, '', '2023-06-05 14:46:58.629309', '2023-06-05 14:46:58.629309', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ca5d6f70ae9d06abdf', 'BHADRESHWAR KOLE', NULL, 0, '', '2023-06-05 15:32:48.407912', '2023-06-05 15:32:48.407912', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2c32f01458fd8b45cb', 'rajshekar', NULL, 0, '', '2023-06-05 16:16:19.427684', '2023-06-05 16:16:19.427684', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37a059d68941d0287e', 'balay sharmar', NULL, 0, '', '2023-06-05 16:56:54.599009', '2023-06-05 16:56:54.599009', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aca2843aec60d2063e', 'anup ;bomik', NULL, 0, '', '2023-06-05 18:02:53.431855', '2023-06-05 18:02:53.431855', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d2114b33b3c728b4d6', 'faizal', NULL, 0, '', '2023-06-05 18:19:14.291649', '2023-06-05 18:19:14.291649', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dbaa61f70b9cef4fbd', 'govinda', NULL, 50, '', '2023-06-05 19:51:43.719188', '2023-06-05 19:51:43.719188', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c2b0c049b7f4c56b3', 'menhaj', NULL, 0, '', '2023-06-05 19:53:34.941936', '2023-06-05 19:53:34.941936', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('87113b4e51daa891b2', 'padmavathi', NULL, 0, '', '2023-06-06 13:05:54.051903', '2023-06-06 13:05:54.051903', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8e78a8c915e4179c5f', 'kuldeep sigh', NULL, 0, '', '2023-06-06 17:09:23.748890', '2023-06-06 17:09:23.748890', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('992ec69fcc0f3afba0', 'goutham bavri', NULL, 0, '', '2023-06-06 19:01:35.865356', '2023-06-06 19:01:35.865356', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2fb41061fd056c10ad', 'ajijul', NULL, 0, '', '2023-06-07 12:47:32.982086', '2023-06-07 12:47:32.982086', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6cfc11e1d905517a9c', 'n j j', NULL, 50, '', '2023-06-07 13:31:44.728596', '2023-06-07 13:31:44.728596', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e43e67d9e09efc85ed', 'RAMJAN', NULL, 0, '', '2023-06-08 14:02:26.987267', '2023-06-08 14:02:26.987267', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('644cbf45f4e5a45d8e', 'KOLEN', NULL, 0, '', '2023-06-09 10:44:13.625141', '2023-06-09 10:44:13.625141', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e3ebe84d089afff0af', 'DUDH KUMAR', NULL, 0, '', '2023-06-09 11:59:34.515623', '2023-06-09 11:59:34.515623', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('419a2bc2fa310d0d49', 'DEBU BOMIK', NULL, 0, '', '2023-06-09 13:18:47.459531', '2023-06-09 13:18:47.459531', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6f3dd3bf17af481cac', 'RANJEET MAITHI', NULL, 0, '', '2023-06-09 13:40:56.262660', '2023-06-09 13:40:56.262660', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9ee38a2e2d24f6c989', 'shubho deep', NULL, 0, '', '2023-06-09 19:11:03.022608', '2023-06-09 19:11:03.022608', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6d31e710ad3e7e328f', 'b s k j', NULL, 0, '', '2023-06-09 20:52:29.275690', '2023-06-09 20:52:29.275690', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4caa878117f49ffd39', 'farooq da', NULL, 0, '', '2023-06-10 12:06:43.106544', '2023-06-10 12:06:43.106544', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('87833d9104b342ced2', 'ramesh hajra', NULL, 0, '', '2023-06-10 12:50:46.428515', '2023-06-10 12:50:46.428515', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3f4e0e4520206c0c2d', 'rameena', NULL, 0, '', '2023-06-10 15:11:32.322594', '2023-06-10 15:11:32.322594', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0b133e0d1b7468177b', 'bitu', NULL, 0, '', '2023-06-10 18:49:15.515999', '2023-06-10 18:49:15.515999', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c1445c7dcc4bb1f68', 'hajrath ali', NULL, 0, '', '2023-06-10 20:50:17.049504', '2023-06-10 20:50:17.049504', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5686ca7dc5baa24016', 'rana', NULL, 0, '', '2023-06-11 10:41:06.157723', '2023-06-11 10:41:06.157723', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2c473958866eec16e4', 'PRONAB', NULL, 30, '', '2023-06-12 11:01:23.057401', '2023-06-12 11:01:23.057401', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c828e140da7a320f5', 'jigar soni', NULL, 0, '', '2023-06-12 14:09:58.245794', '2023-06-12 14:09:58.245794', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aba42478ec1769a43a', 's k ali', NULL, 0, '', '2023-06-12 14:42:33.321199', '2023-06-12 14:42:33.321199', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('647b7518792e9253a1', 'musharaf sheikh', NULL, 0, '', '2023-06-12 15:18:37.711919', '2023-06-12 15:18:37.711919', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('afea5997f9615aa648', 'DENEY', NULL, 0, '', '2023-06-12 18:55:51.861651', '2023-06-12 18:55:51.861651', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('50e1ad96324fbcc519', 'S K RAGHU', NULL, 0, '', '2023-06-12 19:09:29.501826', '2023-06-12 19:09:29.501826', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bb7f842f21f5b22ee4', 'JULFIKAR', NULL, 0, '', '2023-06-12 19:59:37.220518', '2023-06-12 19:59:37.220518', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('617472606684b86022', 'fardin', NULL, 0, '', '2023-06-13 11:53:50.918629', '2023-06-13 11:53:50.918629', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b49408ce1b716709e4', 'SAMEER GOSH', NULL, 0, '', '2023-06-13 12:22:19.800928', '2023-06-13 12:22:19.800928', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d5e06925af95f7e8b', 'MAHYANDH', NULL, 0, '', '2023-06-13 12:30:08.386794', '2023-06-13 12:30:08.386794', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('de5cf32608688978e7', 'SAMAR DULAI', NULL, 0, '', '2023-06-13 15:11:40.277664', '2023-06-13 15:11:40.277664', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d3f57c01ae4565a325', 'AKTAR', NULL, 0, '', '2023-06-13 16:09:38.014674', '2023-06-13 16:09:38.014674', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fec298ca9b59ab1929', 'ABHIJEET PANDIT', NULL, 0, '', '2023-06-13 17:26:10.936355', '2023-06-13 17:26:10.936355', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d63ff76b2633b54165', 'POLASH BARUL', NULL, 0, '', '2023-06-14 13:42:25.045280', '2023-06-14 13:42:25.045280', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('94a1bc762145885393', 'anif khan', NULL, 0, '', '2023-06-14 13:55:55.045608', '2023-06-14 13:55:55.045608', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3174330fa6efd360f9', 'LATHA', NULL, 0, '', '2023-06-15 14:24:30.052945', '2023-06-15 14:24:30.052945', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a3bbcec7f53467bf0f', 'NOOR UDIN', NULL, 0, '', '2023-06-16 12:59:33.336476', '2023-06-16 12:59:33.336476', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('74a73a7c9fd23a0fa0', 'ASHOK BHAI', NULL, 0, '', '2023-06-16 19:58:33.190153', '2023-06-16 19:58:33.190153', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('31c8f5200359481695', 'P B R KING', NULL, 0, '', '2023-06-17 12:20:24.404083', '2023-06-17 12:20:24.404083', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7b2ed1065b0749e480', 'AMRESH', NULL, 0, '', '2023-06-17 16:23:36.228818', '2023-06-17 16:23:36.228818', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('51a99062335738d957', 'MUNNIRUL', NULL, 0, '', '2023-06-17 17:11:28.201583', '2023-06-17 17:11:28.201583', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c150c6f16c918093b9', 'madhu sudhan', NULL, 0, '', '2023-06-18 12:15:42.613016', '2023-06-18 12:15:42.613016', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('325539b5bd741c6889', 'bsk j', NULL, 0, '', '2023-06-19 12:04:30.370984', '2023-06-19 12:04:30.370984', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('87a78634bd0489f525', 'rajkumar dulai', NULL, 0, '', '2023-06-19 17:53:31.127416', '2023-06-19 17:53:31.127416', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea3b79888a5e0d8921', 'arman', NULL, 0, '', '2023-06-19 21:15:29.466830', '2023-06-19 21:15:29.466830', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7a8a8fa3607a1cf6ff', 'MADHU PAL', NULL, 0, '', '2023-06-20 12:45:11.248247', '2023-06-20 12:45:11.248247', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a6b5d872b6bd90e1d0', 'pbr', NULL, 0, '', '2023-06-20 18:36:48.970994', '2023-06-20 18:36:48.970994', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('539b4d0ccd5bbee718', 'sri ganesh', NULL, 0, '', '2023-06-20 18:43:11.019795', '2023-06-20 18:43:11.019795', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('750fed8f2cbbc4a2e9', 'bman', NULL, 0, '', '2023-06-20 21:14:54.925193', '2023-06-20 21:14:54.925193', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ba616fbc259adafd72', 'MONTU BERA', NULL, 0, '', '2023-06-21 11:14:01.777806', '2023-06-21 11:14:01.777806', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('484f556a71e67f872e', 'M D', NULL, 0, '', '2023-06-21 11:40:47.858263', '2023-06-21 11:40:47.858263', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('57b9289abd5a8cd14c', 'minhaj', NULL, 0, '', '2023-06-21 18:33:23.217754', '2023-06-21 18:33:23.217754', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('98f0749183f427f691', 'vincent graph', NULL, 0, '', '2023-06-21 19:48:00.600453', '2023-06-21 19:48:00.600453', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('471f5b47dea3a119a7', 'LIC PVR', NULL, 0, '', '2023-06-22 11:53:43.067526', '2023-06-22 11:53:43.067526', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('957d92c00e13e4736d', 'MANTRI', NULL, 0, '', '2023-06-22 17:08:24.529842', '2023-06-22 17:08:24.529842', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c45b87fdedfbb1bb5', 'CHANDRASHEKAR', NULL, 0, '', '2023-06-22 17:38:20.947178', '2023-06-22 17:38:20.947178', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('67f0c49d35671f8a57', 'HANISHUL', NULL, 0, '', '2023-06-23 10:48:36.839707', '2023-06-23 10:48:36.839707', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fbea0a7125f87b6145', 'SANTU GOSH', NULL, 0, '', '2023-06-23 11:38:35.495993', '2023-06-23 11:38:35.495993', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('569130c418a6521ba9', 'p shah', NULL, 0, '', '2023-06-23 19:20:27.414430', '2023-06-23 19:20:27.414430', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e279a1f1f26934ca71', 'SAJAN', NULL, 0, '', '2023-06-24 11:12:43.430952', '2023-06-24 11:12:43.430952', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3e0c7542a7f4097936', 'ROBI', NULL, 0, '', '2023-06-24 11:13:07.741918', '2023-06-24 11:13:07.741918', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('388699025b2e8419ac', 'BUDHO', NULL, 0, '', '2023-06-24 12:31:20.129968', '2023-06-24 12:31:20.129968', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cc42db0f2c6f93c29f', 's k alami', NULL, 0, '', '2023-06-24 17:14:13.380040', '2023-06-24 17:14:13.380040', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60f961167772e06875', 'sher singh', NULL, 0, '', '2023-06-24 19:04:08.841362', '2023-06-24 19:04:08.841362', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f238a970cb28fb9282', 'hannan', NULL, 0, '', '2023-06-24 19:37:25.322839', '2023-06-24 19:37:25.322839', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1846e2269276f4dc32', 'SANWAR', NULL, 0, '', '2023-06-25 10:38:03.392610', '2023-06-25 10:38:03.392610', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9f220d722071679510', 'J D', NULL, 0, '', '2023-06-25 13:56:50.953486', '2023-06-25 13:56:50.953486', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('000d9836fc8c9fbc61', 'AIYAPPAN', NULL, 0, '', '2023-06-26 11:52:08.287345', '2023-06-26 11:52:08.287345', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d86b7ca30d856014b3', 'ROMAN', NULL, 0, '', '2023-06-26 13:57:11.374997', '2023-06-26 13:57:11.374997', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('65e09f4f1bd847459e', 'kali adarsh', NULL, 0, '', '2023-06-26 15:12:19.880512', '2023-06-26 15:12:19.880512', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('deea78de53c4c6a642', 'SRI HANSA', NULL, 0, '', '2023-06-26 15:46:40.265970', '2023-06-26 15:46:40.265970', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dcf6a8a1c8f0f3198d', 'SRI HARSHA', NULL, 0, '', '2023-06-26 15:56:08.151498', '2023-06-26 15:56:08.151498', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('16a47f3ce7f763925b', 'TAPAS PATRA', NULL, 0, '', '2023-06-26 18:58:51.130496', '2023-06-26 18:58:51.130496', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d2a82be05a5d2a2cec', 'S G', NULL, 0, '', '2023-06-26 19:00:44.410720', '2023-06-26 19:00:44.410720', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('246990eb3a2db615f5', 'K P J', NULL, 0, '', '2023-06-27 10:57:04.711659', '2023-06-27 10:57:04.711659', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3c60dad6cc1a2ad84b', 'tapas pramanik', NULL, 0, '', '2023-06-27 18:09:05.856924', '2023-06-27 18:09:05.856924', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0634d35695fd9b5160', 'sajol mandal', NULL, 0, '', '2023-06-27 20:25:15.332312', '2023-06-27 20:25:15.332312', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('711e2660e15671e146', 'spd', NULL, 0, '', '2023-06-27 20:38:25.008280', '2023-06-27 20:38:25.008280', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8a231a84acd5cfb44a', 'ANMOL JEWELLERS', NULL, 0, '', '2023-06-28 14:58:08.412179', '2023-06-28 14:58:08.412179', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d8403ef4d3bf547e4', 'ANAND BERA', '9880252706', 0, '', '2023-06-28 15:11:26.518451', '2023-06-28 15:11:26.518451', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8c2d7d29f250234d92', 'PBR LIC', NULL, 0, '', '2023-06-28 16:20:07.182717', '2023-06-28 16:20:07.182717', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8e87d9210a4d6501eb', 'SOUROJEET', NULL, 0, '', '2023-06-28 18:45:34.085274', '2023-06-28 18:45:34.085274', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dc328e7602ee62e779', 'GOUTHAM SHAW', NULL, 0, '', '2023-06-28 20:24:40.697946', '2023-06-28 20:24:40.697946', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bf3368dfe6c4a6f79c', 'hariprasad', NULL, 0, '', '2023-06-29 11:21:42.592971', '2023-06-29 11:21:42.592971', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2e91e01b5651ddcffb', 'sow.mytregi', NULL, 0, '', '2023-06-29 12:22:58.952713', '2023-06-29 12:22:58.952713', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('759474f64e91ea8268', 'purna das', '6362492067', 0, '', '2023-06-29 12:45:46.720658', '2023-06-29 12:45:46.720658', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d863762ce84791e71', 'minaj', NULL, 0, '', '2023-06-29 14:41:24.403697', '2023-06-29 14:41:24.403697', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e06d57a7eb37ea26a0', 'mahaveer jewels', NULL, 0, '', '2023-06-29 17:44:22.477837', '2023-06-29 17:44:22.477837', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f670668c9f5d136005', 'shilpa', NULL, 0, '', '2023-06-29 19:25:09.626810', '2023-06-29 19:25:09.626810', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c593d5d884bb111833', 'CHANDHAN', NULL, 0, '', '2023-07-01 16:54:49.201772', '2023-07-01 16:54:49.201772', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('39b44b79fd4ffed028', 'HAJRAT ALI', NULL, 0, '', '2023-07-01 18:11:12.237663', '2023-07-01 18:11:12.237663', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('491950352510bf5dcc', 'PRASANJEET BERA', NULL, 0, '', '2023-07-01 19:03:03.009588', '2023-07-01 19:03:03.009588', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3dc2c65ae29a0aa3d2', 'THARUN', NULL, 0, '', '2023-07-01 19:41:46.449747', '2023-07-01 19:41:46.449747', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9a4569443ac060ef3e', 'veenaa ray', NULL, 0, '', '2023-07-02 15:11:44.386334', '2023-07-02 15:11:44.386334', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fd2a49431a87b31c8f', 'BIKAS MANDAL', NULL, 0, '', '2023-07-03 10:13:03.059197', '2023-07-03 10:13:03.059197', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9dbb800e1e845aa5c5', 'S K AZIM', NULL, 0, '', '2023-07-03 11:08:10.249408', '2023-07-03 11:08:10.249408', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8beebdf2be13ee39e2', 'ANAND PAUL', NULL, 0, '', '2023-07-03 11:57:37.137227', '2023-07-03 11:57:37.137227', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('93cb371136b70509c0', 'SAPAN DAS', '9880626896', 0, '', '2023-07-03 12:55:26.292001', '2023-07-03 12:55:26.292001', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32691ae9e817794d83', 'TONY', NULL, 0, '', '2023-07-03 13:38:28.311812', '2023-07-03 13:38:28.311812', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b71c9bc4553d6f75ba', 'RINTU DAS', NULL, 0, '', '2023-07-03 15:52:13.230326', '2023-07-03 15:52:13.230326', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1b71da762332ffb10e', 'BISWAJEET DEVNATH', NULL, 0, '', '2023-07-03 17:12:07.075109', '2023-07-03 17:12:07.075109', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a2be51faac357eb576', 'MIRAJ', NULL, 0, '', '2023-07-03 20:33:03.837472', '2023-07-03 20:33:03.837472', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5fcacc34aeedfbc9f8', 'VIVEK', NULL, 0, '', '2023-07-03 20:36:17.516274', '2023-07-03 20:36:17.516274', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6145094e436e6a9c25', 'sunitha bandari', NULL, 0, '', '2023-07-04 16:18:58.283598', '2023-07-04 16:18:58.283598', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fb6e77f1cfe064b862', 'SRI KRISHNA', NULL, 0, '', '2023-07-04 16:35:54.555158', '2023-07-04 16:35:54.555158', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3458b8558205b86c21', 'SK MOTILAL', NULL, 0, '', '2023-07-04 17:56:55.381944', '2023-07-04 17:56:55.381944', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5b0cd6f893992f7e82', 'RANJEET', NULL, 0, '', '2023-07-04 18:07:27.541703', '2023-07-04 18:07:27.541703', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1af9170a029aee9548', 'soumodeep', NULL, 0, '', '2023-07-04 18:35:15.895632', '2023-07-04 18:35:15.895632', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1adf5e8583056f13b4', 'veena arya', NULL, 0, '', '2023-07-04 21:06:49.485777', '2023-07-04 21:06:49.485777', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1a7102d0c452f57e6a', 'ram das', NULL, 0, '', '2023-07-04 21:12:21.093225', '2023-07-04 21:12:21.093225', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3693e2721077e913e0', 'SOUMIN', NULL, 0, '', '2023-07-05 10:59:40.304980', '2023-07-05 10:59:40.304980', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a0dfc33bf75cf389f9', 'GANESH BAG', NULL, 0, '', '2023-07-05 11:50:55.579415', '2023-07-05 11:50:55.579415', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ee2231ab52b6c33811', 'GANESH BHAG', NULL, 0, '', '2023-07-05 11:51:10.650059', '2023-07-05 11:51:10.650059', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d97c88cc53e1cf303a', 'ASHISH BERA', NULL, 0, '', '2023-07-05 13:35:41.566322', '2023-07-05 13:35:41.566322', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('867743dc97966c1889', 'TAPAN SIHA', NULL, 0, '', '2023-07-05 14:13:58.969106', '2023-07-05 14:13:58.969106', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1bd553deb55079a330', 'maa durga 2', NULL, 0, '', '2023-07-05 14:49:40.856436', '2023-07-05 14:49:40.856436', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('92f1abe47e7a0d8ba0', 'sow rahjans', NULL, 0, '', '2023-07-05 16:36:04.647382', '2023-07-05 16:36:04.647382', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1833f5d98245e2c763', 'ranjith miaithi', NULL, 0, '', '2023-07-05 17:59:37.336342', '2023-07-05 17:59:37.336342', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('56b2dd05de21bf74ca', 'rita madam', NULL, 0, '', '2023-07-05 19:10:56.792642', '2023-07-05 19:10:56.792642', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8c4a84cdca189aaa68', 'ASHISH PAL', NULL, 0, '', '2023-07-06 12:38:21.588776', '2023-07-06 12:38:21.588776', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('11965c6025e4c0e391', 'PINTU RING', NULL, 0, '', '2023-07-06 15:30:29.846276', '2023-07-06 15:30:29.846276', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b6e11d4989a01abf18', 'SHEK ABDUR', NULL, 0, '', '2023-07-06 17:57:58.451924', '2023-07-06 17:57:58.451924', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4b0f3c80cff0fe57ce', 'SHAM DAS', NULL, 0, '', '2023-07-06 18:04:45.485626', '2023-07-06 18:04:45.485626', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3dfd4919c3da19dae6', 'SANATHA', NULL, 0, '', '2023-07-06 19:37:04.147738', '2023-07-06 19:37:04.147738', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7511fded36232b4109', 'RAKIBUL', NULL, 0, '', '2023-07-07 11:50:19.069822', '2023-07-07 11:50:19.069822', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b466f0ec42b25f7a92', 'RAMESH RAO', NULL, 0, '', '2023-07-07 13:37:12.110235', '2023-07-07 13:37:12.110235', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fc1a636d0c4d46818b', 'pratik', NULL, 0, '', '2023-07-08 14:00:36.655301', '2023-07-08 14:00:36.655301', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('11020e77fb028911b4', 'ashok mandal', NULL, 0, '', '2023-07-08 16:18:49.551062', '2023-07-08 16:18:49.551062', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a4eae598fbd0db7ef', 'govindho', NULL, 0, '', '2023-07-08 19:43:02.011990', '2023-07-08 19:43:02.011990', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aceb12d07d060558a8', 'basu bhai', NULL, 0, '', '2023-07-08 20:15:14.966732', '2023-07-08 20:15:14.966732', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3467bf3e87447204c8', 'PUNENDU', NULL, 0, '', '2023-07-10 15:45:45.584386', '2023-07-10 15:45:45.584386', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d077b7c60dfecc435e', 'LLIYAZ', NULL, 0, '', '2023-07-10 20:37:31.252364', '2023-07-10 20:37:31.252364', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('71ede92b7b9834542d', 'GADIYE', NULL, 0, '', '2023-07-11 10:47:29.009469', '2023-07-11 10:47:29.009469', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('06a9b9877fe1fdb60d', 'SUJEET BANGAL', NULL, 0, '', '2023-07-11 12:09:11.556963', '2023-07-11 12:09:11.556963', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3a16e811cb685fd423', 'NEELESH', NULL, 0, '', '2023-07-11 12:32:06.046938', '2023-07-11 12:32:06.046938', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('33650ba9caae410467', 'S L N', NULL, 0, '', '2023-07-11 15:16:59.958378', '2023-07-11 15:16:59.958378', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a28fa6fce2a13e7d16', 'DEEPAK PRMANIK', NULL, 0, '', '2023-07-11 15:26:58.413996', '2023-07-11 15:26:58.413996', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('044be33ab043c019db', 'KRISNA', NULL, 0, '', '2023-07-11 16:06:54.336187', '2023-07-11 16:06:54.336187', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1cbdc5462e12ae0aee', 'S A', NULL, 0, '', '2023-07-11 16:49:43.882638', '2023-07-11 16:49:43.882638', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('668c219f255d79f9c1', 'V J C', NULL, 0, '', '2023-07-11 17:31:01.643749', '2023-07-11 17:31:01.643749', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('22c3e580581a8d223d', 'N J R', NULL, 0, '', '2023-07-11 18:01:14.259335', '2023-07-11 18:01:14.259335', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f7f45ed77754964cf0', 'somshekar', NULL, 0, '', '2023-07-12 17:00:29.007582', '2023-07-12 17:00:29.007582', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c393dc9dabbd6f883f', 'SURJEET DAS', NULL, 0, '', '2023-07-13 11:30:05.217934', '2023-07-13 11:30:05.217934', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d022e28f000fab99f', 'chennappa', NULL, 0, '', '2023-07-13 13:05:06.454828', '2023-07-13 13:05:06.454828', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9c531ffaa242bcea66', 'CITY MARKET POLICE STATION', NULL, 0, '', '2023-07-13 13:07:05.657940', '2023-07-13 13:07:05.657940', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('510f1ba206449997bb', 'SANDEEP SADRA', NULL, 0, '', '2023-07-13 21:01:37.330416', '2023-07-13 21:01:37.330416', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a71bc11dd343aa88ad', 'SURESH', NULL, 0, '', '2023-07-14 17:00:37.674640', '2023-07-14 17:00:37.674640', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('227adf2d112d132a1f', 'PJV', NULL, 0, '', '2023-07-15 12:44:17.199422', '2023-07-15 12:44:17.199422', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('376c39477f70997e56', 'MOIJUDDIN', NULL, 0, '', '2023-07-15 13:34:58.029247', '2023-07-15 13:34:58.029247', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('83b888ed5ed09678e4', 'NAND KUMAR', NULL, 0, '', '2023-07-15 17:42:46.067930', '2023-07-15 17:42:46.067930', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('562440f00ad21eab92', 'VIKAS RANKA', NULL, 0, '', '2023-07-15 18:51:28.760490', '2023-07-15 18:51:28.760490', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('43d7041aa859b30c83', 'RAKHAL MALIK', NULL, 0, '', '2023-07-16 11:18:44.792085', '2023-07-16 11:18:44.792085', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('868de6dc7a9dab16aa', 'afzal', NULL, 0, '', '2023-07-16 13:06:06.423516', '2023-07-16 13:06:06.423516', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d76a1e41b3f87d21df', 'sudanshu', NULL, 0, '', '2023-07-16 14:10:56.702221', '2023-07-16 14:10:56.702221', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f48062ccec3c6d654b', 'NG', NULL, 0, '', '2023-07-17 11:25:50.651653', '2023-07-17 11:25:50.651653', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3769d40b35539d327b', 'ANMOL SRIKANTH', NULL, 0, '', '2023-07-17 13:01:32.521597', '2023-07-17 13:01:32.521597', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1f55baed1179b907af', 'SG', NULL, 0, '', '2023-07-17 13:08:20.196467', '2023-07-17 13:08:20.196467', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7737bfe430d662cbd2', 'MAHESH', NULL, 0, '', '2023-07-17 17:23:56.963550', '2023-07-17 17:23:56.963550', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2a741d85a50ba46289', 'SK AZIM', NULL, 0, '', '2023-07-17 21:31:04.044955', '2023-07-17 21:31:04.044955', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b18bfbe1d38bf0e91b', 'RAM KANJI', NULL, 0, '', '2023-07-18 12:25:20.468787', '2023-07-18 12:25:20.468787', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('acbef3ab8aa0f671b7', 'HRITHIK', NULL, 0, '', '2023-07-18 13:47:07.039468', '2023-07-18 13:47:07.039468', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('17eff0094cce9cfd1a', 'P M', NULL, 0, '', '2023-07-18 14:38:40.260268', '2023-07-18 14:38:40.260268', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('42f84038a47ee36ead', 'SAPNA', NULL, 0, '', '2023-07-18 17:39:03.559159', '2023-07-18 17:39:03.559159', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('14127cbd052663930a', 'S L J', NULL, 0, '', '2023-07-18 18:14:51.084025', '2023-07-18 18:14:51.084025', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b86803170187c7cf11', 'NANDA KUMAR', NULL, 0, '', '2023-07-19 14:02:07.503239', '2023-07-19 14:02:07.503239', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bb930b81a238a2f532', 'SUSHMA JAIN', NULL, 0, '', '2023-07-19 14:14:12.480633', '2023-07-19 14:14:12.480633', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('49721ba89c6ee64c41', 'PURVESH', NULL, 0, '', '2023-07-19 17:19:27.888723', '2023-07-19 17:19:27.888723', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e7b2c4f99cc9c98cd9', 'SAMAR DAS', NULL, 0, '', '2023-07-19 19:05:24.416821', '2023-07-19 19:05:24.416821', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('882d69068137867a48', 'JABAR', NULL, 0, '', '2023-07-19 19:55:27.737807', '2023-07-19 19:55:27.737807', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('48c414ff6174db6213', 'JAI LAXMI JEWELLERS', NULL, 0, '', '2023-07-19 20:07:52.666213', '2023-07-19 20:07:52.666213', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('045b66b96ba0044726', 'PUSITHA', NULL, 0, '', '2023-07-20 10:56:42.918289', '2023-07-20 10:56:42.918289', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a1c2e0a45310e1e37d', 'DAYAM', NULL, 0, '', '2023-07-20 13:26:15.503935', '2023-07-20 13:26:15.503935', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('83effeb33d79532e25', 'BAPPI DAS', NULL, 0, '', '2023-07-20 14:01:09.913273', '2023-07-20 14:01:09.913273', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4829492361f0976579', 'HARI', NULL, 0, '', '2023-07-20 14:53:37.823949', '2023-07-20 14:53:37.823949', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0cca3c04abd9699c62', 'HANS', NULL, 0, '', '2023-07-20 19:24:00.940223', '2023-07-20 19:24:00.940223', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7ed2cf4f9646da7861', 'BASAVA RAJA', NULL, 0, '', '2023-07-20 21:41:03.372687', '2023-07-20 21:41:03.372687', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ef1a9218babe752164', 'HIRU', NULL, 0, '', '2023-07-21 12:24:26.070279', '2023-07-21 12:24:26.070279', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3b2f33adca453cf3cb', 'SPR LOTUS', NULL, 0, '', '2023-07-21 18:07:25.258007', '2023-07-21 18:07:25.258007', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1940df63a180c184c1', 'NJJ', NULL, 0, '', '2023-07-22 12:12:23.565852', '2023-07-22 12:12:23.565852', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c5b421543ff62121d3', 'SPR', NULL, 0, '', '2023-07-22 15:13:37.582827', '2023-07-22 15:13:37.582827', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3414d50196086134a4', 'PALLAV', NULL, 0, '', '2023-07-22 16:09:01.369562', '2023-07-22 16:09:01.369562', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5dd2c11287eecddbe0', 'AURUM', NULL, 0, '', '2023-07-23 13:31:07.203359', '2023-07-23 13:31:07.203359', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9f1e1665ab62181c2c', 'SOILEN', NULL, 0, '', '2023-07-24 11:45:54.311534', '2023-07-24 11:45:54.311534', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5db104b4c98460159f', 'BALAJI', NULL, 0, '', '2023-07-24 12:42:13.552229', '2023-07-24 12:42:13.552229', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('16d1b38475dfe67e9a', 'BISWAJEET PANDIT', NULL, 0, '', '2023-07-24 15:26:06.812346', '2023-07-24 15:26:06.812346', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cfc9c3222b63dc128a', 'ANUPAM', NULL, 0, '', '2023-07-24 15:47:40.189407', '2023-07-24 15:47:40.189407', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ca8b08abaf432f7fa9', 'PRAKASH', NULL, 0, '', '2023-07-24 19:44:16.868954', '2023-07-24 19:44:16.868954', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('42d56a1f64ac6fdd09', 'SUBHIR', NULL, 0, '', '2023-07-24 21:44:46.066084', '2023-07-24 21:44:46.066084', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ff4526c8d028728b86', 'PUSPA', NULL, 0, '', '2023-07-25 12:18:24.272231', '2023-07-25 12:18:24.272231', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c3d792922bd0ce4b17', 'PUSHPA', NULL, 0, '', '2023-07-25 12:18:34.935614', '2023-07-25 12:18:34.935614', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e591515f7b5553e16a', 'PRASANJEET DAS', NULL, 0, '', '2023-07-25 17:07:19.186617', '2023-07-25 17:07:19.186617', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('755c591521ea4185a6', 'MUNNA', NULL, 0, '', '2023-07-25 19:23:11.885447', '2023-07-25 19:23:11.885447', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4fa251235d2276b2e1', 'NA', NULL, 0, '', '2023-07-25 21:12:15.335984', '2023-07-25 21:12:15.335984', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5a8ddc80d8a56f1c76', 'p h m', NULL, 0, '', '2023-07-26 12:48:59.133299', '2023-07-26 12:48:59.133299', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('98c2ac5f638cd3bcdb', 'manya shree jewellers', NULL, 0, '', '2023-07-26 17:50:22.582347', '2023-07-26 17:50:22.582347', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('faa19910030785ab02', 'piku', NULL, 0, '', '2023-07-26 20:30:49.270991', '2023-07-26 20:30:49.270991', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('218d02541ae61621cf', 'GOUTHAM MONDAL', NULL, 0, '', '2023-07-27 12:54:53.322553', '2023-07-27 12:54:53.322553', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('63c7a384c249676d57', 'PRADEEP GOSH', NULL, 0, '', '2023-07-27 14:55:00.937954', '2023-07-27 14:55:00.937954', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fd7b301c0c0a53de28', 'l i c', NULL, 0, '', '2023-07-27 15:47:53.013959', '2023-07-27 15:47:53.013959', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2afd09e417b44513c3', 'SHUBHANKAR BAG', NULL, 0, '', '2023-07-27 16:27:28.500727', '2023-07-27 16:27:28.500727', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea18de6930a56951a2', 'DUNGARAM', NULL, 0, '', '2023-07-27 18:19:21.937312', '2023-07-27 18:19:21.937312', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('23334684ed8fe951f3', 'SANJEET DAS', NULL, 0, '', '2023-07-27 20:31:16.658558', '2023-07-27 20:31:16.658558', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('93f092970b78084fcd', 'RATAN RAJ', NULL, 0, '', '2023-07-27 20:42:11.257678', '2023-07-27 20:42:11.257678', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('65ad5a262498919e4d', 'LOKESH', NULL, 0, '', '2023-07-29 12:38:47.139985', '2023-07-29 12:38:47.139985', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5bfac521ec39d64e9f', 'niru', NULL, 0, '', '2023-07-29 12:50:56.026008', '2023-07-29 12:50:56.026008', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea8aac30293302c331', 'GOUTHAM DHAN', NULL, 0, '', '2023-07-29 14:22:48.847686', '2023-07-29 14:22:48.847686', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('91afd5014876816d28', 'JAIN DAIMONDS', NULL, 0, '', '2023-07-29 14:32:55.603232', '2023-07-29 14:32:55.603232', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('533326f6cd52d7bda2', 'SATYJEET SASMAL', NULL, 0, '', '2023-07-29 15:22:59.957691', '2023-07-29 15:22:59.957691', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('34e1d8b3151c82e633', 'BUBAI', NULL, 0, '', '2023-07-29 19:16:12.621948', '2023-07-29 19:16:12.621948', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3f8dd7ce9e886466d7', 'BISWAJEET PANJA', NULL, 0, '', '2023-07-29 20:51:40.541035', '2023-07-29 20:51:40.541035', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('516fa64b1eef23a793', 'SHEK ALAM', NULL, 0, '', '2023-07-29 21:34:01.673617', '2023-07-29 21:34:01.673617', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3428dcdddb7ad4678c', 'SUSHANTHO PATRA', NULL, 0, '', '2023-07-30 10:14:08.045078', '2023-07-30 10:14:08.045078', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('232882da78efde11e7', 'GANESH PASWAN', NULL, 0, '', '2023-07-30 11:21:06.041030', '2023-07-30 11:21:06.041030', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1d83e577676aae6d2c', 'ABHIJEET', NULL, 0, '', '2023-07-30 12:42:39.002466', '2023-07-30 12:42:39.002466', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ad19c1c2739e75957', 'NIRUP', NULL, 0, '', '2023-07-30 14:28:37.023724', '2023-07-30 14:28:37.023724', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8274ea75d1431ef265', 'ANANDO BIYO', NULL, 0, '', '2023-07-31 10:44:32.381452', '2023-07-31 10:44:32.381452', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a2514d3c3b4416b08c', 'RS', NULL, 0, '', '2023-07-31 11:51:56.861640', '2023-07-31 11:51:56.861640', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4eb5d422b5457063a3', 'SHAILENDRA', NULL, 0, '', '2023-07-31 17:00:07.033996', '2023-07-31 17:00:07.033996', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('01b8c801ccab7e667d', 'ASHOK VAISHNAV', NULL, 0, '', '2023-07-31 20:23:54.031526', '2023-07-31 20:23:54.031526', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('810eea65c249a233b5', 'NIVAS SAWANTHO', '9083157758', 0, '', '2023-08-01 15:16:58.258902', '2023-08-01 15:16:58.258902', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('503e6ab1a5873c4746', 'MANASA', NULL, 0, '', '2023-08-01 20:05:58.485544', '2023-08-01 20:05:58.485544', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('86c3a3cad2cf43facb', 'TITAN', NULL, 0, '', '2023-08-02 13:50:24.932322', '2023-08-02 13:50:24.932322', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('98217131e2f4355fbf', 'AKASH RAHULA', NULL, 0, '', '2023-08-02 15:31:29.145972', '2023-08-02 15:31:29.145972', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1fe78dd8c89cdd06ad', 'JHONY', NULL, 0, '', '2023-08-02 17:52:13.076803', '2023-08-02 17:52:13.076803', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ca405a45918413ddfc', 'BHAVANI SINGH', NULL, 0, '', '2023-08-02 18:03:59.764209', '2023-08-02 18:03:59.764209', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('42eae25e5f3c62428c', 'ZULFIKAR', NULL, 0, '', '2023-08-02 18:14:21.389060', '2023-08-02 18:14:21.389060', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6dd9a70d14e4cc5144', 'SUMAN PAKIRA', '8310780350', 0, '', '2023-08-02 20:49:18.130886', '2023-08-02 20:49:18.130886', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('470db81c29bd3e45b0', 'SUDHIR', NULL, 0, '', '2023-08-03 14:32:41.778068', '2023-08-03 14:32:41.778068', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7d1c8f3b105efe1ac8', 'AMARNATH V N', NULL, 0, '', '2023-08-03 18:10:04.802292', '2023-08-03 18:10:04.802292', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2939f2c1937e2f0d62', 'SAYON', NULL, 0, '', '2023-08-04 15:20:48.494581', '2023-08-04 15:20:48.494581', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bc296347df1848c10b', 'ramzan', NULL, 0, '', '2023-08-04 21:00:06.841810', '2023-08-04 21:00:06.841810', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3373b1816d057fe97d', 'brahamaya', NULL, 0, '', '2023-08-05 19:42:29.462229', '2023-08-05 19:42:29.462229', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1a575e881587f1e2e5', 'parmila jewellers', NULL, 0, '', '2023-08-05 20:45:23.713250', '2023-08-05 20:45:23.713250', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3e1c4d148f291dcdac', 'KALIPADU BOMIK', NULL, 0, '', '2023-08-07 11:47:59.136939', '2023-08-07 11:47:59.136939', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4a033630477784a4f9', 'K N B', NULL, 0, '', '2023-08-07 13:26:00.655091', '2023-08-07 13:26:00.655091', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fd15602aa68393f2f9', 'BALIYE SHARMA', NULL, 0, '', '2023-08-07 13:27:51.578430', '2023-08-07 13:27:51.578430', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c24cae43d093a07510', 'JITEN', NULL, 0, '', '2023-08-07 13:41:43.051350', '2023-08-07 13:41:43.051350', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0f2ca337a646abd805', 'NISHET', NULL, 0, '', '2023-08-07 13:42:52.083105', '2023-08-07 13:42:52.083105', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8ee09950c1f5e3f23f', 'sushanth maithi', NULL, 0, '', '2023-08-07 14:27:38.755129', '2023-08-07 14:27:38.755129', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2185a28688a00065b7', 'r d', NULL, 0, '', '2023-08-07 17:58:31.787458', '2023-08-07 17:58:31.787458', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2e6d6f8442fca1b124', 'R D', NULL, 0, '', '2023-08-07 17:58:54.796253', '2023-08-07 17:58:54.796253', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('522abafdeff0352498', 'KALLI BHAI', NULL, 0, '', '2023-08-07 21:25:56.650479', '2023-08-07 21:25:56.650479', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('30e899d01337b8cd97', 'PINTU PARTHO', '6360608700', 0, '', '2023-08-08 11:22:16.768387', '2023-08-08 11:22:16.768387', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b19a305ce9c1fa5424', 'SUJEET KAR', NULL, 0, '', '2023-08-08 12:25:34.163649', '2023-08-08 12:25:34.163649', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e29f8f345cc5265dcf', 'hemath das', NULL, 0, '', '2023-08-08 14:20:33.099241', '2023-08-08 14:20:33.099241', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7e75b10dc3653af654', 'surjeet bang', NULL, 0, '', '2023-08-08 19:14:55.439845', '2023-08-08 19:14:55.439845', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1bb3a564dee534c5c3', 'biswakarma jewellers', '6290944880', 0, '', '2023-08-09 13:56:05.444208', '2023-08-09 13:56:05.444208', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ffb95f2c8b54980e3a', 'sujeet dulai', '9986070139', 0, '', '2023-08-09 14:26:43.080721', '2023-08-09 14:26:43.080721', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('81eeb4b5000c91a9e9', 'poltu sawanth', NULL, 0, '', '2023-08-09 18:27:13.956000', '2023-08-09 18:27:13.956000', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b28389e77bb50a6e7e', 'kalluda', NULL, 0, '', '2023-08-09 21:44:11.080669', '2023-08-09 21:44:11.080669', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6b3f337f6be47fbfff', 'vijay raj', NULL, 0, '', '2023-08-10 09:58:41.848088', '2023-08-10 09:58:41.848088', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('10a2c2ac7dd7e3569f', 'MOLIYE DHARA', NULL, 0, '', '2023-08-10 12:32:54.456319', '2023-08-10 12:32:54.456319', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c054de4786bc5ffe9', 'PRASHANTH MANDAL', '9886647637', 0, '', '2023-08-10 21:15:17.525328', '2023-08-10 21:15:17.525328', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b84b4694c383227125', 'MR CHANDRASHEKAR', NULL, 0, '', '2023-08-11 10:52:51.930714', '2023-08-11 10:52:51.930714', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8bfc6f990ed7fddc6f', 'JK', NULL, 0, '', '2023-08-11 11:40:09.501258', '2023-08-11 11:40:09.501258', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('abdbd01c01792f1652', 'SK RAFIQUE', NULL, 0, '', '2023-08-11 12:07:06.870131', '2023-08-11 12:07:06.870131', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('06b8990681dd40e6db', 'A J', '9916745789', 0, '', '2023-08-11 12:21:20.877801', '2023-08-11 12:21:20.877801', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('767b1b715cbcea3c04', 'PIJOSH', NULL, 0, '', '2023-08-11 15:01:25.459080', '2023-08-11 15:01:25.459080', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a819b0402ac410613c', 'shubhash gundwla', '9110211249', 0, '', '2023-08-11 17:23:28.777014', '2023-08-11 17:23:28.777014', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3d8f517b6ca3fd211e', 'N J GOLD', NULL, 0, '', '2023-08-12 11:21:34.869612', '2023-08-12 11:21:34.869612', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('23b72351d6f15413a0', 'HEMANTH KUMAR', NULL, 0, '', '2023-08-12 15:33:02.534493', '2023-08-12 15:33:02.534493', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('21425abe0b32d076e0', 'SUDEEP GOLDHAR', NULL, 0, '', '2023-08-12 17:00:10.170600', '2023-08-12 17:00:10.170600', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d90a61a5b44f76f8c9', 'RAMESH ROY', NULL, 0, '', '2023-08-12 19:12:14.062054', '2023-08-12 19:12:14.062054', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('df2889675efc6d4b5d', 'APPORVA', NULL, 0, '', '2023-08-12 19:36:36.569873', '2023-08-12 19:36:36.569873', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cef1bbc255a6da6d39', 'NARSHIMA', NULL, 0, '', '2023-08-12 20:51:27.543423', '2023-08-12 20:51:27.543423', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9eccc8aa085df4cbcb', 'ayan sarkar', NULL, 0, '', '2023-08-14 10:53:12.773815', '2023-08-14 10:53:12.773815', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('14603d9d29c6363d0c', 'm j d', NULL, 0, '', '2023-08-14 11:08:56.821197', '2023-08-14 11:08:56.821197', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a1d2e98fdfb81005ee', 'SATHISH', NULL, 0, '', '2023-08-14 12:25:46.753350', '2023-08-14 12:25:46.753350', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dcc30ac8a537620ef1', 'ADHIR', NULL, 0, '', '2023-08-14 13:01:21.658760', '2023-08-14 13:01:21.658760', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e9ddde7f50b3b1075f', 'BISWAJEET MAITHI', NULL, 0, '', '2023-08-14 15:45:21.105689', '2023-08-14 15:45:21.105689', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('04e8911877a5f01ccb', 'POLISH BABA', NULL, 0, '', '2023-08-15 10:16:22.215547', '2023-08-15 10:16:22.215547', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ec64aa53f85d3b335c', 'KARAN', NULL, 0, '', '2023-08-15 16:02:09.698218', '2023-08-15 16:02:09.698218', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('14b25821966a09a156', 'RAVI JEWELLERS', NULL, 0, '', '2023-08-15 17:47:26.167427', '2023-08-15 17:47:26.167427', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fbb9bf7383d16baedf', 'TAPAN SARKAR', NULL, 0, '', '2023-08-15 17:53:54.000302', '2023-08-15 17:53:54.000302', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('261c6f8f01bc609449', 'SONIYA', NULL, 0, '', '2023-08-16 12:51:22.078619', '2023-08-16 12:51:22.078619', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('80fbd2b850f370de29', 'SHUBHAS GUNDU WALA', NULL, 0, '', '2023-08-16 13:23:12.345001', '2023-08-16 13:23:12.345001', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('53f47f9bf52a12cfb8', 'M P J', NULL, 0, '', '2023-08-16 16:50:52.614179', '2023-08-16 16:50:52.614179', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('119b428b1bdc1aa78b', 'SAMUEL THAKUR', NULL, 0, '', '2023-08-16 16:55:40.140249', '2023-08-16 16:55:40.140249', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('054febe61ce9b5e67e', 'MADHU MANNA', NULL, 0, '', '2023-08-16 17:13:10.802075', '2023-08-16 17:13:10.802075', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cf7f1cbe832de76387', 'LOKNATH', NULL, 0, '', '2023-08-16 19:40:21.263076', '2023-08-16 19:40:21.263076', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8f253e335c0a96e283', 'SHANKAR', NULL, 0, '', '2023-08-17 19:24:02.455044', '2023-08-17 19:24:02.455044', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3ebceda491453dde89', 'POLASH DAS', '9620582156', 30, '', '2023-08-18 13:22:58.478182', '2023-08-18 13:22:58.478182', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f6c57e8bc9ab8e252b', 'AMAR ROY', NULL, 0, '', '2023-08-18 17:14:03.614604', '2023-08-18 17:14:03.614604', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('42cad2915f023be649', 'KAMAL SANKI', NULL, 0, '', '2023-08-19 11:12:07.698990', '2023-08-19 11:12:07.698990', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a7b03281b147503d76', 'AKHIL', NULL, 0, '', '2023-08-19 12:06:40.579745', '2023-08-19 12:06:40.579745', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c14d2edbf618732d85', 'P K', NULL, 0, '', '2023-08-19 14:29:03.685296', '2023-08-19 14:29:03.685296', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e02b574ab01b0f8868', 'PRITESH', NULL, 0, '', '2023-08-19 15:00:20.992119', '2023-08-19 15:00:20.992119', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('51c6d8c5c438457982', 'BISWAJEET MONDAL', NULL, 0, '', '2023-08-19 16:18:24.857827', '2023-08-19 16:18:24.857827', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9da08b329bf57eaca9', 'BAPPAN DAS', NULL, 0, '', '2023-08-19 18:30:13.771172', '2023-08-19 18:30:13.771172', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6dc34e6f917463bf1d', 'SOW.APARNA', NULL, 0, '', '2023-08-20 10:49:31.792094', '2023-08-20 10:49:31.792094', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d91df9c2755b2c34f5', 'SHUBAM', NULL, 0, '', '2023-08-20 12:56:12.882019', '2023-08-20 12:56:12.882019', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aca1d4344bf780bdd7', 'SHUHAS', NULL, 0, '', '2023-08-20 13:28:58.036633', '2023-08-20 13:28:58.036633', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('72186c91f7a388c648', 'TOUCH 22', NULL, 0, '', '2023-08-21 14:27:24.543490', '2023-08-21 14:27:24.543490', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6c2e2078be387e1665', 'AKASH JEWEL', NULL, 0, '', '2023-08-21 14:42:57.886813', '2023-08-21 14:42:57.886813', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60dfba2a04affdb0f2', 'chandhan jewellers', NULL, 0, '', '2023-08-21 16:05:58.177133', '2023-08-21 16:05:58.177133', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('03ca7e8c8b688358af', 'tapas devnath', '7407750366', 0, '', '2023-08-21 16:20:36.771537', '2023-08-21 16:20:36.771537', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b29ad213f5a620be51', 'krish nandu', NULL, 0, '', '2023-08-21 18:39:49.856791', '2023-08-21 18:39:49.856791', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('92430951d6c3c1f4c5', 'SUKUMAR DAS', NULL, 0, '', '2023-08-22 12:28:02.382884', '2023-08-22 12:28:02.382884', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b921f0df08e7d466f1', 'P J V', NULL, 0, '', '2023-08-22 14:20:54.783494', '2023-08-22 14:20:54.783494', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eb4ca744a77ba06bab', 'akib', NULL, 0, '', '2023-08-22 19:47:52.604941', '2023-08-22 19:47:52.604941', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('482d9fa33ca247790a', 'CM', NULL, 0, '', '2023-08-23 10:52:06.368994', '2023-08-23 10:52:06.368994', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('67c89a177cfc54e508', 'rakesh baliya', NULL, 0, '', '2023-08-23 12:16:09.498522', '2023-08-23 12:16:09.498522', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bcdc0e5b65c3916b5b', 'banis', NULL, 0, '', '2023-08-23 14:19:34.015812', '2023-08-23 14:19:34.015812', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa0edc2999fdb8e830', 'JOHNY', NULL, 0, '', '2023-08-23 16:54:24.196252', '2023-08-23 16:54:24.196252', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c72e988614a14c192', 'RADIKA', NULL, 0, '', '2023-08-23 19:24:11.440028', '2023-08-23 19:24:11.440028', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2c8bca849e5c408016', 'AFIZUL', NULL, 0, '', '2023-08-24 11:32:10.704555', '2023-08-24 11:32:10.704555', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a6870aa2075acbf84a', 'NAITHAYE MANNA', NULL, 0, '', '2023-08-24 13:31:14.321604', '2023-08-24 13:31:14.321604', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('df1d38cc1940b3f870', 'SITARAM', NULL, 0, '', '2023-08-24 17:47:05.445986', '2023-08-24 17:47:05.445986', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cb1c302113078eaf94', 'VIJAY', NULL, 0, '', '2023-08-24 19:24:30.597339', '2023-08-24 19:24:30.597339', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2131592c4d9cae29d0', 'KALABARAN', NULL, 0, '', '2023-08-25 12:16:19.179007', '2023-08-25 12:16:19.179007', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c7ce01706bad9f1076', 'B J N', NULL, 0, '', '2023-08-26 19:18:50.272247', '2023-08-26 19:18:50.272247', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d90cb7b81815411a7b', 'V J N', NULL, 0, '', '2023-08-26 19:19:29.760216', '2023-08-26 19:19:29.760216', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aeb432c1cd6eb413d5', 'RUPESH', NULL, 0, '', '2023-08-27 12:46:27.301469', '2023-08-27 12:46:27.301469', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ae13209804dd04b889', 'praladh', NULL, 0, '', '2023-08-27 12:51:13.107923', '2023-08-27 12:51:13.107923', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('661a1576f6a7fe6fd0', 'kashinath', NULL, 0, '', '2023-08-27 13:29:21.314613', '2023-08-27 13:29:21.314613', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('565435940215005924', 'SUMO DEEP', NULL, 0, '', '2023-08-28 11:54:56.559541', '2023-08-28 11:54:56.559541', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fb7da3f9f6803cf0d3', 'S  S', NULL, 0, '', '2023-08-28 13:24:31.557998', '2023-08-28 13:24:31.557998', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2b52750a31febf86da', 'RAVI K N', NULL, 0, '', '2023-08-28 13:49:15.769831', '2023-08-28 13:49:15.769831', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('27b1739e35fc4fff06', 'SUMANTHU KABI', NULL, 0, '', '2023-08-28 14:01:16.809587', '2023-08-28 14:01:16.809587', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('70bf76d99937636936', 'baren', NULL, 0, '', '2023-08-28 16:05:14.927564', '2023-08-28 16:05:14.927564', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('641e4772cda5e8052d', 'nithin', NULL, 0, '', '2023-08-28 17:46:07.376527', '2023-08-28 17:46:07.376527', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('09979f55c45734a661', 'doshi', NULL, 0, '', '2023-08-28 18:44:24.858343', '2023-08-28 18:44:24.858343', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bc90d43db93ad8cb2a', 'v c', NULL, 0, '', '2023-08-28 19:47:29.317932', '2023-08-28 19:47:29.317932', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('398a4a7945be49e1b5', 'yash', NULL, 0, '', '2023-08-28 19:59:22.906885', '2023-08-28 19:59:22.906885', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8a481f7e30aa395dd4', 'veena', NULL, 50, '', '2023-08-28 20:00:17.637500', '2023-08-28 20:00:17.637500', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7538256ab6368508dd', 's g t', NULL, 0, '', '2023-08-28 20:08:12.763271', '2023-08-28 20:08:12.763271', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('35bf2b09e4c9eb605e', 'SIDHIK', NULL, 0, '', '2023-08-29 10:24:47.056010', '2023-08-29 10:24:47.056010', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('47ea44f88c868191fa', 'MANNA SREE J', NULL, 0, '', '2023-08-29 10:54:40.232755', '2023-08-29 10:54:40.232755', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ecfbc7c90939ce0440', 'NJ', NULL, 0, '', '2023-08-29 12:37:41.555684', '2023-08-29 12:37:41.555684', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('084a677d4d1c155067', 'JAYDEV', NULL, 0, '', '2023-08-29 15:19:04.486614', '2023-08-29 15:19:04.486614', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('51915ab256f9ade3ea', 'KOPPARAM J', NULL, 0, '', '2023-08-29 16:06:31.821101', '2023-08-29 16:06:31.821101', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8f886121b849be3769', 'PRITHVI', NULL, 0, '', '2023-08-29 19:59:51.607581', '2023-08-29 19:59:51.607581', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c3cbf5ab3d9541d19d', 'SIDHNATH', NULL, 0, '', '2023-08-30 12:58:52.177310', '2023-08-30 12:58:52.177310', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b53bf09cef83e03ffe', 'GOUTHAM ADAK', '9513161473', 0, '', '2023-08-30 14:06:37.198768', '2023-08-30 14:06:37.198768', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('de866ba83f7d0005b3', 'sujeet bhera', NULL, 0, '', '2023-08-30 21:18:43.438373', '2023-08-30 21:18:43.438373', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ecd6ef37ccf0d63b56', 'KATU', NULL, 0, '', '2023-08-31 13:15:08.237012', '2023-08-31 13:15:08.237012', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e2bb806f94db9cdffe', 'RAJU MAITHI', '7892203747', 0, '', '2023-09-01 12:58:23.703779', '2023-09-01 12:58:23.703779', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2fed996fdb0ec57dd8', 'MUNEER', NULL, 0, '', '2023-09-01 14:30:10.473847', '2023-09-01 14:30:10.473847', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ead66b3d39c5c86f5e', 'dilip maitya', NULL, 0, '', '2023-09-02 10:57:23.428619', '2023-09-02 10:57:23.428619', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d293e1b41af3801c8', 'kempa gowda', NULL, 0, '', '2023-09-03 12:51:05.011913', '2023-09-03 12:51:05.011913', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('71c6d39ad35070d527', 'GPJ GURUPRASAD J', NULL, 0, '', '2023-09-04 18:03:47.788893', '2023-09-04 18:03:47.788893', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d1119de1e71404738e', 'SANJEET', NULL, 0, '', '2023-09-04 18:12:28.724035', '2023-09-04 18:12:28.724035', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0831a0528dc0cecb92', 'RAKSHAT', NULL, 0, '', '2023-09-04 18:17:49.195324', '2023-09-04 18:17:49.195324', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea186d6d6cb12f0ab9', 'manu', NULL, 0, '', '2023-09-04 18:31:06.756961', '2023-09-04 18:31:06.756961', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a75ac2beaba8b3e8a5', 'sk roko', NULL, 30, '', '2023-09-04 18:35:07.815639', '2023-09-04 18:35:07.815639', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('466103e4569b463451', 'rajab ali', NULL, 0, '', '2023-09-04 18:54:51.535446', '2023-09-04 18:54:51.535446', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('030403a77315129079', 'amjed', NULL, 0, '', '2023-09-04 20:06:39.739822', '2023-09-04 20:06:39.739822', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9b5d983c5bfde2aa13', 'ataull', '8105440368', 0, '', '2023-09-04 21:43:19.938996', '2023-09-04 21:43:19.938996', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fb25ec2d4bf3b39dbd', 'VIJAY SONI', NULL, 0, '', '2023-09-05 15:44:17.178975', '2023-09-05 15:44:17.178975', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ac694e492262aef167', 'SRI GURU PRASAD', NULL, 0, '', '2023-09-06 15:20:28.480904', '2023-09-06 15:20:28.480904', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('63587c513a2cbfc2f4', 'GOPAL', NULL, 0, '', '2023-09-06 15:29:33.835361', '2023-09-06 15:29:33.835361', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a590a9bd10b44ec0b8', 'RAVI KUMAR', NULL, 0, '', '2023-09-06 19:10:33.243808', '2023-09-06 19:10:33.243808', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9f57919c86cb2f5190', 'NISHI', NULL, 0, '', '2023-09-07 11:38:46.198736', '2023-09-07 11:38:46.198736', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f0e9eca8bc8e67b659', 'punith', NULL, 0, '', '2023-09-07 14:24:48.163800', '2023-09-07 14:24:48.163800', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('17ae69af5cacbedc1d', 'anju HALDAR', '8123693522', 0, '', '2023-09-07 21:31:18.319669', '2023-09-07 21:31:18.319669', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1d2e824e212ad7bfc5', 'prem', NULL, 0, '', '2023-09-08 12:37:47.701170', '2023-09-08 12:37:47.701170', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4f60ce9a7c6d2bceb8', 'E M K', NULL, 0, '', '2023-09-08 17:03:57.829706', '2023-09-08 17:03:57.829706', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5bee213b21cd66a00d', 'S NAGESH', NULL, 0, '', '2023-09-09 13:47:14.557554', '2023-09-09 13:47:14.557554', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c0ce12ea04564cf870', 'TINKU SONI', NULL, 0, '', '2023-09-09 16:06:37.341412', '2023-09-09 16:06:37.341412', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('679c8dfdc7233d198f', 'RAMESH MONDAL', NULL, 0, '', '2023-09-09 16:22:59.822557', '2023-09-09 16:22:59.822557', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9ec991d529f697825c', 'VJN', NULL, 0, '', '2023-09-10 11:23:04.417044', '2023-09-10 11:23:04.417044', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('24d557aa45d70d17b8', 'JADHAV', NULL, 0, '', '2023-09-11 12:04:01.914037', '2023-09-11 12:04:01.914037', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('acfe4d6d88333af3fc', 'SANJEEV PARAMANIK', NULL, 0, '', '2023-09-11 12:26:32.715666', '2023-09-11 12:26:32.715666', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a408760bac08d21339', 'SHIVA', NULL, 0, '', '2023-09-11 12:49:53.782742', '2023-09-11 12:49:53.782742', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ab5ee5daf999faa700', 'C K VERMA', NULL, 0, '', '2023-09-11 14:16:15.845450', '2023-09-11 14:16:15.845450', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8eabc0a36493adf07d', 'SAMIR', NULL, 0, '', '2023-09-11 15:52:18.263542', '2023-09-11 15:52:18.263542', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('07537df4fd40319f5e', 'JEWEL', NULL, 0, '', '2023-09-11 16:40:38.676251', '2023-09-11 16:40:38.676251', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1591bffea8817c9f60', 'ANUP JANA', NULL, 0, '', '2023-09-11 19:59:21.661071', '2023-09-11 19:59:21.661071', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0d9da46d354a5636c5', 'SHYMUL PRADHAN', NULL, 0, '', '2023-09-11 20:15:31.817552', '2023-09-11 20:15:31.817552', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3d61ce2f26cc41f82b', 'NADEEM ROUTH', NULL, 0, '', '2023-09-12 11:47:04.975118', '2023-09-12 11:47:04.975118', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('88321264f13be943e8', 'SAMIM', NULL, 0, '', '2023-09-12 12:15:38.888069', '2023-09-12 12:15:38.888069', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('12e09b021defbf26b7', 'rudhra', NULL, 0, '', '2023-09-12 13:39:33.403296', '2023-09-12 13:39:33.403296', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5439214c93102105ca', 'pintu patra', NULL, 0, '', '2023-09-12 13:56:37.916150', '2023-09-12 13:56:37.916150', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5d30e30ceb56f9169f', 'goutham sawantho', NULL, 0, '', '2023-09-12 14:12:55.732738', '2023-09-12 14:12:55.732738', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7ff65462d956643eb5', 'subendu godiye', NULL, 0, '', '2023-09-12 16:25:29.137616', '2023-09-12 16:25:29.137616', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cae84614f86762e069', 'SANJU', NULL, 0, '', '2023-09-14 16:06:09.364295', '2023-09-14 16:06:09.364295', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('13edee2ea2e1cd924d', 'ARIJEET', NULL, 0, '', '2023-09-14 16:12:31.836582', '2023-09-14 16:12:31.836582', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('824fa76f5627d58b1c', 'DHALPATH', NULL, 0, '', '2023-09-15 12:37:01.205323', '2023-09-15 12:37:01.205323', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('78b4cee6b9ef488c86', 'PANNA', NULL, 0, '', '2023-09-15 13:30:33.983186', '2023-09-15 13:30:33.983186', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c9c466008bb502c836', 'ansari', NULL, 0, '', '2023-09-15 19:46:34.712645', '2023-09-15 19:46:34.712645', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c238879c3ab2538dd', 'AYAN', NULL, 0, '', '2023-09-16 15:24:54.177036', '2023-09-16 15:24:54.177036', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3f8852b9525e4190b8', 'burapal', NULL, 0, '', '2023-09-16 16:20:37.908194', '2023-09-16 16:20:37.908194', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3da2beaab4406eb4a3', 'lalith bhai', NULL, 0, '', '2023-09-16 18:27:56.571440', '2023-09-16 18:27:56.571440', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('82fde98e6273bfbc9a', 'pjr', NULL, 0, '', '2023-09-16 21:23:19.267691', '2023-09-16 21:23:19.267691', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7eaa1d23c02c39d3eb', 'SWASTIK JEWELS', NULL, 0, '', '2023-09-18 14:06:01.697491', '2023-09-18 14:06:01.697491', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32e7dc6d0a78fd5fd9', 'SK ALAM', NULL, 0, '', '2023-09-20 11:39:33.628150', '2023-09-20 11:39:33.628150', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d8a830f799a8d1ca7', 'NIDHI', NULL, 0, '', '2023-09-21 13:00:13.737377', '2023-09-21 13:00:13.737377', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0eb9f2893bae575616', 'RONITH', NULL, 0, '', '2023-09-21 14:50:16.601962', '2023-09-21 14:50:16.601962', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3f681a095241f9d560', 'MACHINE BHAI', NULL, 0, '', '2023-09-21 18:28:44.616760', '2023-09-21 18:28:44.616760', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('de443772ef81f1bc6b', 'gyan', NULL, 0, '', '2023-09-22 15:59:58.027383', '2023-09-22 15:59:58.027383', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('27a1ddc59d2bf9c2ea', 'mr vishal katarle', NULL, 0, '', '2023-09-22 16:56:28.801155', '2023-09-22 16:56:28.801155', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1a353bc26f66c5dd47', 'prem jewellers', NULL, 0, '', '2023-09-22 17:02:12.059856', '2023-09-22 17:02:12.059856', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8e6c847d9d5be4f449', 'varun', NULL, 0, '', '2023-09-22 18:25:28.453363', '2023-09-22 18:25:28.453363', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f7ebc692f5145bec5f', 'debashish maithi', NULL, 0, '', '2023-09-22 19:35:14.303320', '2023-09-22 19:35:14.303320', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eb1e4fd242b7b2e341', 'k r h s', NULL, 0, '', '2023-09-22 20:21:12.442451', '2023-09-22 20:21:12.442451', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2796fceb3799d3c681', 'DEEPANKAR SANTRA', NULL, 0, '', '2023-09-23 12:42:29.194442', '2023-09-23 12:42:29.194442', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f81f7945ce34cd6ec7', 'jeetender', NULL, 0, '', '2023-09-23 16:39:39.184809', '2023-09-23 16:39:39.184809', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b213e89df40969a1dc', 'poornandu', NULL, 0, '', '2023-09-23 17:46:29.937070', '2023-09-23 17:46:29.937070', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0751a207370939f286', 'nishit patra', NULL, 0, '', '2023-09-23 18:59:47.861340', '2023-09-23 18:59:47.861340', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2bc24384fb5ac02483', 'MOHAN MAITHYE', NULL, 0, '', '2023-09-24 10:47:38.596032', '2023-09-24 10:47:38.596032', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('af7c267a40adaede47', 'BOLANATH GORAI', '8792629086', 0, '', '2023-09-24 11:06:28.520748', '2023-09-24 11:06:28.520748', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0f448ba5559cc13c80', 'SP', NULL, 0, '', '2023-09-24 12:40:15.387089', '2023-09-24 12:40:15.387089', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1b7946b5778df00e75', 'VISHWANATH', NULL, 0, '', '2023-09-24 13:27:48.989755', '2023-09-24 13:27:48.989755', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('006cae3ff1922a868b', 'RAMCHANDRA', NULL, 0, '', '2023-09-24 13:45:50.048153', '2023-09-24 13:45:50.048153', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4be00fadaa221eb26b', 'SANJEET MANDAL', NULL, 0, '', '2023-09-25 12:56:15.408891', '2023-09-25 12:56:15.408891', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d07a50157b9200af1f', 'SHEIK RAFIQUE', NULL, 0, '', '2023-09-25 17:17:16.976267', '2023-09-25 17:17:16.976267', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a6571a1d10f0ca10b1', 'NEEL', NULL, 0, '', '2023-09-25 21:20:42.938377', '2023-09-25 21:20:42.938377', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('895b1e286ed2c86dd0', 'RK', NULL, 0, '', '2023-09-26 12:07:08.331950', '2023-09-26 12:07:08.331950', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d7410856f0afbdfa97', 'SHEIKH GYASUDIN', NULL, 0, '', '2023-09-26 12:42:16.208187', '2023-09-26 12:42:16.208187', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('30d64f39bb6c782058', 'sbj dmm', NULL, 0, '', '2023-09-26 14:56:37.260828', '2023-09-26 14:56:37.260828', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9b7e2c8ce500b96b0e', 'SBJ DMM', NULL, 0, '', '2023-09-26 14:57:04.060005', '2023-09-26 14:57:04.060005', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('570bd6a47f854431d9', 'SK BHADSHAH', NULL, 0, '', '2023-09-26 15:02:51.804329', '2023-09-26 15:02:51.804329', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('46e90a3da330318fea', 'manjanna', NULL, 0, '', '2023-09-26 16:34:04.208404', '2023-09-26 16:34:04.208404', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('717acc92a2381f0c21', 'chandu da', NULL, 0, '', '2023-09-26 18:35:09.886737', '2023-09-26 18:35:09.886737', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('19002e09ded45ca2c2', 'suhjal', NULL, 0, '', '2023-09-26 18:47:25.298432', '2023-09-26 18:47:25.298432', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e338841b3157d5aad7', 'shubal', NULL, 0, '', '2023-09-26 19:00:58.535527', '2023-09-26 19:00:58.535527', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b4c39a6279b69aed2d', 'debu da', NULL, 0, '', '2023-09-26 19:37:40.856057', '2023-09-26 19:37:40.856057', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d17835bf7315860723', 'UJJAL GOSH', NULL, 0, '', '2023-09-27 11:38:30.591478', '2023-09-27 11:38:30.591478', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('06a49f72194ca1a9b3', 'sanjay bhag', NULL, 0, '', '2023-09-27 12:31:53.812757', '2023-09-27 12:31:53.812757', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8af1fe2919becd76cc', 'akshay gosh', NULL, 0, '', '2023-09-27 12:35:42.565696', '2023-09-27 12:35:42.565696', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('efd6e13277224420e8', 'ADIR', NULL, 0, '', '2023-09-28 12:03:02.726880', '2023-09-28 12:03:02.726880', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62122f4e9b1fdef3ca', 'NAVEEN', NULL, 0, '', '2023-09-28 14:25:41.421760', '2023-09-28 14:25:41.421760', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6d9ca44667e30090d7', 'manojeet roy', NULL, 0, '', '2023-09-28 18:44:05.989654', '2023-09-28 18:44:05.989654', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e1bf7337b2149270b1', 'sourab pal', '8073081881', 0, 'SETH', '2023-09-28 18:58:59.111113', '2023-09-28 18:58:59.111113', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1471a6d61b49639f09', 'yash raj', NULL, 0, '', '2023-09-28 19:57:09.783906', '2023-09-28 19:57:09.783906', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60a6792c31f80169e6', 'RAM DAS', '9945737211', 0, '', '2023-09-30 11:46:20.773236', '2023-09-30 11:46:20.773236', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2e7098f69a201f40f9', 'SAIKAT', NULL, 0, '', '2023-09-30 11:55:54.624075', '2023-09-30 11:55:54.624075', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1687650c5774a9cf6f', 'jaffer', NULL, 0, '', '2023-09-30 17:14:21.067213', '2023-09-30 17:14:21.067213', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2bf1ef821e3a6031f0', 'tutul', NULL, 0, '', '2023-09-30 17:36:06.780006', '2023-09-30 17:36:06.780006', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a7cffa882f82e5ea74', 'sanjeet sawantho', NULL, 0, '', '2023-09-30 18:13:25.206494', '2023-09-30 18:13:25.206494', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('606a9e9cd21259edab', 'VIMAL', NULL, 0, '', '2023-10-01 11:19:54.251010', '2023-10-01 11:19:54.251010', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7db1d1cdcc4fa632d8', 'CHANDU KARMAKAR', NULL, 0, '', '2023-10-01 12:04:35.404797', '2023-10-01 12:04:35.404797', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('84cb32a61526fbd895', 'SK BAPPAN', NULL, 0, '', '2023-10-01 13:22:10.081346', '2023-10-01 13:22:10.081346', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6f96e268278cc61ce0', 'BHIM DAS', NULL, 0, '', '2023-10-02 10:39:16.833682', '2023-10-02 10:39:16.833682', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e5c44a35b294158078', 'SANYAZ', NULL, 0, '', '2023-10-02 12:14:19.617657', '2023-10-02 12:14:19.617657', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6bf981f52f37b243c4', 'GOPAL SAU', NULL, 0, '', '2023-10-02 16:29:12.812318', '2023-10-02 16:29:12.812318', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1a7933ada97df4b5e0', 'WAGLE', NULL, 0, '', '2023-10-02 17:55:05.933766', '2023-10-02 17:55:05.933766', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4acde1977c990767db', 'DEBA', NULL, 0, '', '2023-10-02 20:09:26.145327', '2023-10-02 20:09:26.145327', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2542d5cff05edf1495', 'JOGESH', NULL, 0, '', '2023-10-03 10:30:29.088082', '2023-10-03 10:30:29.088082', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c7cbba43f1c09804ab', 'b g s', NULL, 0, '', '2023-10-03 11:08:41.544696', '2023-10-03 11:08:41.544696', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8c1f0eb3e9b5e03850', 'sani das', NULL, 0, '', '2023-10-03 14:38:34.585248', '2023-10-03 14:38:34.585248', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c2d2a963e9b33bd6d', 'sudesh', NULL, 0, '', '2023-10-03 15:53:35.947500', '2023-10-03 15:53:35.947500', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a6aca084a38abe5f4e', 'shyamal mondal', NULL, 0, '', '2023-10-03 16:43:53.597890', '2023-10-03 16:43:53.597890', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0b86131d47564133e4', 'g c', NULL, 0, '', '2023-10-03 16:48:55.310641', '2023-10-03 16:48:55.310641', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cf7e38e222ae49e2cd', 'gadya', NULL, 0, '', '2023-10-03 18:02:30.375023', '2023-10-03 18:02:30.375023', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('57c85f09c07ea883d0', 'raju karmakar', NULL, 0, '', '2023-10-03 20:25:58.022336', '2023-10-03 20:25:58.022336', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3c615376c0bdb64cdd', 'p s n', NULL, 0, '', '2023-10-04 14:33:20.664358', '2023-10-04 14:33:20.664358', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d45a0bf4320a4f326', 'rakha', NULL, 0, '', '2023-10-04 14:45:41.453335', '2023-10-04 14:45:41.453335', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7afe622906bf49f947', 'AJIZ', NULL, 0, '', '2023-10-06 18:57:02.998888', '2023-10-06 18:57:02.998888', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('de4fc1e76a1d9aebbe', 'SRIRAM', NULL, 0, '', '2023-10-06 20:02:11.553530', '2023-10-06 20:02:11.553530', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a36732ef0d19f63658', 'VISHWAKARMA J', NULL, 0, '', '2023-10-07 20:13:43.100935', '2023-10-07 20:13:43.100935', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f20e580df9981ab8cc', 'SLN', NULL, 0, '', '2023-10-07 20:39:04.073122', '2023-10-07 20:39:04.073122', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c9afc646be73244ec1', 'SUBIR', NULL, 0, '', '2023-10-08 12:41:30.297732', '2023-10-08 12:41:30.297732', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('53e9ecd78f54cd80ff', 'SUBIR DAS', NULL, 0, '', '2023-10-08 12:41:41.241528', '2023-10-08 12:41:41.241528', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('312ab3ef34b4bc7f2f', 'syed wajid pasha', NULL, 0, '', '2023-10-08 14:33:57.295658', '2023-10-08 14:33:57.295658', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a701e615b8508c179f', 'SAROJ', NULL, 0, '', '2023-10-08 14:36:06.250340', '2023-10-08 14:36:06.250340', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('527d4218b5d89efc7e', 'BISWAJEET BANGAL', '7975951977', 0, '', '2023-10-09 15:18:21.623564', '2023-10-09 15:18:21.623564', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('052ee4cab171e68207', 'PRADEEP BARDHAN', NULL, 0, '', '2023-10-09 15:35:23.743181', '2023-10-09 15:35:23.743181', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7664b8cec50f5d49a2', 'ANJU', NULL, 0, '', '2023-10-09 19:39:57.531123', '2023-10-09 19:39:57.531123', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dbed7348a4aa121ac8', 'HARA JANA', NULL, 0, '', '2023-10-10 10:35:34.116014', '2023-10-10 10:35:34.116014', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('87b2c427caf06a9377', 'MANORANJAN', NULL, 0, '', '2023-10-10 11:14:51.896482', '2023-10-10 11:14:51.896482', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2da28d68b97b8bebc3', 'SUJAI DAS', NULL, 0, '', '2023-10-10 13:05:27.630245', '2023-10-10 13:05:27.630245', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c21b4eecea98a02932', 'B S J', NULL, 0, '', '2023-10-10 14:49:59.521732', '2023-10-10 14:49:59.521732', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9e8c73d725150873fd', 'ishan mondal', NULL, 0, '', '2023-10-10 17:16:34.342415', '2023-10-10 17:16:34.342415', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d1be506a8f24d47a12', 'a j b', NULL, 0, '', '2023-10-10 18:38:04.634371', '2023-10-10 18:38:04.634371', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cce460d807ab009438', 'sukh chand', NULL, 0, '', '2023-10-10 18:56:42.549663', '2023-10-10 18:56:42.549663', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6bdcae774a52802b52', 'biraj', NULL, 0, '', '2023-10-10 18:58:35.854077', '2023-10-10 18:58:35.854077', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d84af36e8ead837026', 'rehan', NULL, 0, '', '2023-10-11 11:52:09.904797', '2023-10-11 11:52:09.904797', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0c7fe1ed367298b599', 'p r', NULL, 0, '', '2023-10-11 16:30:53.981552', '2023-10-11 16:30:53.981552', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('516a4cae11c5b8be54', 'sayan', NULL, 0, '', '2023-10-11 16:49:37.684335', '2023-10-11 16:49:37.684335', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dd2f7da1c302c2bde4', 'ravi da', NULL, 0, '', '2023-10-11 18:44:00.745665', '2023-10-11 18:44:00.745665', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('461a7355052830fb7a', 'sankit', NULL, 0, '', '2023-10-11 21:20:44.376665', '2023-10-11 21:20:44.376665', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9e1d1a6be0c81cd2b2', 'G K J', NULL, 0, '', '2023-10-12 11:56:29.423664', '2023-10-12 11:56:29.423664', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5eb95f3576ae05055e', 'pradeep adak', NULL, 0, '', '2023-10-12 12:15:35.481786', '2023-10-12 12:15:35.481786', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ab3f3d74ea264d259d', 'MG JELLERS', NULL, 0, '', '2023-10-12 16:04:22.556445', '2023-10-12 16:04:22.556445', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cbee82f19bd3c30073', 'siddhi gold', NULL, 0, '', '2023-10-12 16:12:15.710988', '2023-10-12 16:12:15.710988', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b8fb888c5da69c9a66', 'BIKAS GOSH', '9844122228', 0, '', '2023-10-12 16:52:15.182074', '2023-10-12 16:52:15.182074', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('654ab343ace2909e49', 'BURO PAL', NULL, 0, '', '2023-10-13 15:49:37.000053', '2023-10-13 15:49:37.000053', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('21e924787b67ee83db', 'SHYAMAL', NULL, 0, '', '2023-10-13 16:21:28.753438', '2023-10-13 16:21:28.753438', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c75a26c9b3a046a42a', 'AMAN', NULL, 0, '', '2023-10-13 17:22:22.045147', '2023-10-13 17:22:22.045147', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4a49b5e298f854ef2e', 'SURDEEP', NULL, 0, '', '2023-10-13 18:36:43.590952', '2023-10-13 18:36:43.590952', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('79e25c91e9b701f629', 'SOURAB JACH', NULL, 0, '', '2023-10-14 11:45:12.010424', '2023-10-14 11:45:12.010424', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7fc8b2686132f450dd', 'THIRTHA', NULL, 0, '', '2023-10-14 12:48:57.250652', '2023-10-14 12:48:57.250652', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e9204bc9bf3e304961', 'AZARUDIN SHEIKH', NULL, 0, '', '2023-10-14 13:39:33.153257', '2023-10-14 13:39:33.153257', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7644247eb6b04c1b46', 'P S N', NULL, 0, '', '2023-10-14 17:33:05.870559', '2023-10-14 17:33:05.870559', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5a0bccb2cbd3a3c613', 'KAPIL', NULL, 0, '', '2023-10-14 17:48:14.719700', '2023-10-14 17:48:14.719700', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cc87772743bc657716', 'AKSHAY', NULL, 0, '', '2023-10-14 17:52:15.695182', '2023-10-14 17:52:15.695182', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ce7839bf58db292abb', 'RAJKUMAR TALAMANI', '7676401581', 0, '', '2023-10-14 18:44:45.047605', '2023-10-14 18:44:45.047605', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('93fcda540a54571d87', 'bubai manna', NULL, 0, '', '2023-10-14 19:13:37.496698', '2023-10-14 19:13:37.496698', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d73945aaf5d0ada135', 'anima jana', NULL, 0, '', '2023-10-14 19:21:18.824583', '2023-10-14 19:21:18.824583', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3859a29e3802da89ca', 'sanjeeb', NULL, 0, '', '2023-10-15 10:15:00.928909', '2023-10-15 10:15:00.928909', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2f1eecc50eb30f262c', 'AZIZ', NULL, 0, '', '2023-10-15 11:57:48.128052', '2023-10-15 11:57:48.128052', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('59a31a5220d8d6015b', 'TANGAMANI', NULL, 0, '', '2023-10-15 12:03:11.096617', '2023-10-15 12:03:11.096617', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0808ab1ac5375a937f', 'SHREE PATEL JEWEL', NULL, 0, '', '2023-10-16 12:29:52.796245', '2023-10-16 12:29:52.796245', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('691c65c1312d79b2cf', 'karthik maji', NULL, 0, '', '2023-10-16 14:15:22.752003', '2023-10-16 14:15:22.752003', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1e2676abc5fd698417', 'sahdev devnath', NULL, 0, '', '2023-10-16 14:16:13.922103', '2023-10-16 14:16:13.922103', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d92120c0e8373f0b4b', 'shubhash mondal', NULL, 0, '', '2023-10-16 14:19:17.752780', '2023-10-16 14:19:17.752780', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a482878fb42289896d', 'mosin', NULL, 0, '', '2023-10-16 15:34:00.460589', '2023-10-16 15:34:00.460589', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a7ee5a8c12159abba6', 'purple po # 4100019111-jwso23344', NULL, 0, '', '2023-10-16 16:00:39.518446', '2023-10-16 16:00:39.518446', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('53d28ab2da9b917a81', 'bidhyuth', NULL, 0, '', '2023-10-16 16:31:39.312306', '2023-10-16 16:31:39.312306', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cb8316767df338a618', 'sushil', NULL, 0, '', '2023-10-16 16:50:24.104444', '2023-10-16 16:50:24.104444', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6fc68b067e93ad4689', 'SHUBHASH RANK', NULL, 0, '', '2023-10-17 12:02:10.649437', '2023-10-17 12:02:10.649437', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d53f4de224e35bea77', 'SUBROTHO ROY', NULL, 0, '', '2023-10-17 12:27:19.802244', '2023-10-17 12:27:19.802244', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a3c03f0f4b070c977c', 'SHOBAN', NULL, 0, '', '2023-10-17 14:07:35.385517', '2023-10-17 14:07:35.385517', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('623778978ed8f95f6b', 'SANDEEP SASMAL', NULL, 0, '', '2023-10-17 20:16:38.372854', '2023-10-17 20:16:38.372854', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('79b1bedec1e9d09258', 'ARJUNAA JEWELEERS', NULL, 0, '', '2023-10-18 10:09:59.674716', '2023-10-18 10:09:59.674716', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4692991cbef29d0b93', 'RAHUL JANA', NULL, 0, '', '2023-10-18 13:24:39.154105', '2023-10-18 13:24:39.154105', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9fd15e3f8910ed2204', 'SHABHIR', NULL, 0, '', '2023-10-18 16:00:48.911570', '2023-10-18 16:00:48.911570', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6c058fa8c055b0b192', 'GAJENDRA', NULL, 0, '', '2023-10-18 18:39:49.021472', '2023-10-18 18:39:49.021472', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b199283596c9471941', 'RATHAN RAJ', NULL, 0, '', '2023-10-18 19:46:34.465138', '2023-10-18 19:46:34.465138', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('39c9973a51bd450862', 'MAZARUL', NULL, 0, '', '2023-10-18 20:46:23.710357', '2023-10-18 20:46:23.710357', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7573f9ac1ddf3bf787', 'PREM JEWELLERS', NULL, 0, '', '2023-10-19 11:53:35.675278', '2023-10-19 11:53:35.675278', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ad192e06d7f6ce7834', 'SR MANNA', NULL, 0, '', '2023-10-19 13:00:23.033978', '2023-10-19 13:00:23.033978', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8876bbe7264bef0273', 'singh', NULL, 0, '', '2023-10-19 15:54:52.756370', '2023-10-19 15:54:52.756370', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('22cda1eae0a734b243', 'hiran', NULL, 0, '', '2023-10-19 17:18:56.301371', '2023-10-19 17:18:56.301371', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8c2b389a0fd227cb5d', 'rathan', NULL, 0, '', '2023-10-19 17:24:17.629565', '2023-10-19 17:24:17.629565', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('78b8292ee469147be4', 'AMITH PANJA', NULL, 30, '', '2023-10-20 14:35:41.527031', '2023-10-20 14:35:41.527031', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1b3a62bcc709365419', 'purple- 4100019134', NULL, 0, '', '2023-10-21 13:17:13.797676', '2023-10-21 13:17:13.797676', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8619d1f2cb9fcd3911', 'SYED ADIL', NULL, 0, '', '2023-10-21 14:49:45.109967', '2023-10-21 14:49:45.109967', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1da36a2b72aabb568c', 'p m h', NULL, 0, '', '2023-10-21 15:18:43.622418', '2023-10-21 15:18:43.622418', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9631c90e553ab18aac', 'purple jws023336', NULL, 0, '', '2023-10-21 15:48:08.784300', '2023-10-21 15:48:08.784300', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4fcb517052e45e6fb5', 'purple _jws023336', NULL, 0, '', '2023-10-21 15:48:38.599154', '2023-10-21 15:48:38.599154', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('02c30b4dd571524097', 'N J  CT', NULL, 0, '', '2023-10-22 12:01:50.275008', '2023-10-22 12:01:50.275008', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5f01a7821de2ffa05a', 'KRISHNA NARA', NULL, 0, '', '2023-10-23 12:42:48.658707', '2023-10-23 12:42:48.658707', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4e62da4e859b22c688', 'ANWAR', NULL, 0, '', '2023-10-24 16:08:01.305173', '2023-10-24 16:08:01.305173', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c11486312e19725f32', 'SAMEER PAL', NULL, 0, '', '2023-10-24 17:43:56.076201', '2023-10-24 17:43:56.076201', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('740c577f8426abd5be', 'SUJAL', NULL, 0, '', '2023-10-24 18:06:49.801953', '2023-10-24 18:06:49.801953', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('053fbd8793835738bb', 'KGP', NULL, 0, '', '2023-10-25 10:07:01.492915', '2023-10-25 10:07:01.492915', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d1630eab47c068fb5a', 'tej raj', NULL, 0, '', '2023-10-25 18:35:42.221601', '2023-10-25 18:35:42.221601', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cd8cf6fd885f4b6538', 'MONOJEET DHAMALI', '8971989036', 0, '', '2023-10-26 20:05:50.508133', '2023-10-26 20:05:50.508133', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e1f75805e55b0d6d8c', 'AKASH JANA', NULL, 0, '', '2023-10-27 13:10:55.022087', '2023-10-27 13:10:55.022087', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ebfe8565634bb8033a', 'KHOKAN DAS', '7001995318', 0, '', '2023-10-27 13:44:44.593276', '2023-10-27 13:44:44.593276', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c8f6059d46c9ab8fd3', 'PUSPENDU', NULL, 0, '', '2023-10-27 14:46:14.214995', '2023-10-27 14:46:14.214995', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('96b4a8079e7dfae1fd', 'NJR', NULL, 0, '', '2023-10-27 14:56:48.152018', '2023-10-27 14:56:48.152018', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7792a461860a6cac73', 'ROBIN BORE', NULL, 0, '', '2023-10-27 15:15:12.937738', '2023-10-27 15:15:12.937738', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dff2519bd83152545a', 'G J JEWELLERS', NULL, 0, '', '2023-10-29 13:17:30.988602', '2023-10-29 13:17:30.988602', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d32689be981decc50c', 'JANTU PATRA', '9886380847', 0, '', '2023-10-30 11:25:22.553398', '2023-10-30 11:25:22.553398', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('71711b29ab1476c4c9', 'UTTAM RANG', NULL, 0, '', '2023-10-30 13:55:05.239853', '2023-10-30 13:55:05.239853', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ca818a622b7da129f9', 'BADRINATH', NULL, 0, '', '2023-10-30 19:25:02.288745', '2023-10-30 19:25:02.288745', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a0db84a3d3b24eef9f', 'SHEIKH', NULL, 0, '', '2023-10-31 11:30:22.808933', '2023-10-31 11:30:22.808933', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d94bf9f07df94d631e', 'siddhique', NULL, 0, '', '2023-10-31 13:53:08.641098', '2023-10-31 13:53:08.641098', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d182944db13febb992', 'shakti bera', NULL, 0, '', '2023-10-31 16:18:36.210836', '2023-10-31 16:18:36.210836', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ae717f807a024f6f2c', 'shiekh yakub', NULL, 0, '', '2023-10-31 17:29:58.370062', '2023-10-31 17:29:58.370062', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e3a8e4dd8a1b603b25', 'yakub', '9902979614', 0, '', '2023-10-31 18:06:31.661728', '2023-10-31 18:06:31.661728', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('46528db64488a1e5cc', 'karthik santra', '9986619403', 0, '', '2023-10-31 19:49:44.544075', '2023-10-31 19:49:44.544075', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4e28b2060dee08a30e', 'M D MOHAMED', NULL, 0, '', '2023-11-01 11:31:12.792363', '2023-11-01 11:31:12.792363', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('140f64217d160fd7d4', 'T C', NULL, 0, '', '2023-11-01 14:37:00.142040', '2023-11-01 14:37:00.142040', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7e5bd64ecf905194d2', 'KRISHNA NARYAN', NULL, 0, '', '2023-11-01 14:51:35.741054', '2023-11-01 14:51:35.741054', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2a4c86eb808cf79023', 'DEVRAJ', NULL, 0, '', '2023-11-01 16:15:16.706110', '2023-11-01 16:15:16.706110', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4b740bbce98c1cbcf3', 'A B', NULL, 0, '', '2023-11-01 17:32:53.988534', '2023-11-01 17:32:53.988534', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2258e2b3263d347623', 'samshudin', NULL, 0, '', '2023-11-02 15:31:58.029022', '2023-11-02 15:31:58.029022', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f34ca2fefc3d34f750', 'madhusudhan manna', NULL, 0, '', '2023-11-02 17:50:45.145432', '2023-11-02 17:50:45.145432', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('da409a0d60263ed582', 'surodeep', NULL, 0, '', '2023-11-02 18:55:24.835609', '2023-11-02 18:55:24.835609', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1c9c47c461aeeaeea6', 'mofijul', NULL, 0, '', '2023-11-03 13:15:02.318974', '2023-11-03 13:15:02.318974', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('981336b607abfc9f1c', 'hunnendu', NULL, 0, '', '2023-11-03 16:47:21.090619', '2023-11-03 16:47:21.090619', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1d45f55b962ab4d5bf', 'sudharshan adakk', '7204881264', 0, '', '2023-11-03 20:08:19.190115', '2023-11-03 20:08:19.190115', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d44091687f0eeb8391', 'GOUTHAM GOSH', '9886385962', 0, '', '2023-11-04 12:53:00.456368', '2023-11-04 12:53:00.456368', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ebf80bd6077bc46935', 'ASHEESH', NULL, 0, '', '2023-11-05 11:48:30.899640', '2023-11-05 11:48:30.899640', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f155473253113144b3', 'mukul pramanisk', NULL, 0, '', '2023-11-06 18:05:07.452846', '2023-11-06 18:05:07.452846', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4ddcc813851ac2c529', 'susheel', NULL, 0, '', '2023-11-06 19:03:39.678515', '2023-11-06 19:03:39.678515', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c310e41414a1543c4f', 'nama jewellers', NULL, 0, '', '2023-11-06 19:21:17.031135', '2023-11-06 19:21:17.031135', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('12981d401d6999bf0c', 'sk bappan', '7908468525', 0, '', '2023-11-06 19:52:05.051332', '2023-11-06 19:52:05.051332', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3ac4a7418397bc8acc', 'gorang mondal', '9986135584', 0, '', '2023-11-06 19:56:53.007116', '2023-11-06 19:56:53.007116', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b9ac48b9db2b224d3d', 'mamu polishwala', NULL, 0, '', '2023-11-06 20:37:25.219340', '2023-11-06 20:37:25.219340', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5a2670efdb1c35dbce', 'ACHIN', NULL, 0, '', '2023-11-07 12:06:53.283637', '2023-11-07 12:06:53.283637', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('75a986775a5c10edff', 'M P B', NULL, 0, '', '2023-11-07 17:14:04.518116', '2023-11-07 17:14:04.518116', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6c8a01234cfb45122b', 'POLASH DATTA', NULL, 0, '', '2023-11-07 17:44:57.064336', '2023-11-07 17:44:57.064336', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fc45a590b3553e23f2', 'gopal bera', NULL, 0, '', '2023-11-07 18:59:29.238798', '2023-11-07 18:59:29.238798', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6687b1d03eafa21826', 'saurav pal', NULL, 0, '', '2023-11-07 20:38:15.016078', '2023-11-07 20:38:15.016078', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a4d27c420e1f0aa214', 'PRADEEP RUPREJA', NULL, 0, '', '2023-11-08 11:54:07.775920', '2023-11-08 11:54:07.775920', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('43f552abb7df1a9cc4', 'sairudin', NULL, 0, '', '2023-11-08 13:24:22.939078', '2023-11-08 13:24:22.939078', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4fa2327da85a93a61e', 'sheikh rajab ali', NULL, 0, '', '2023-11-09 15:06:43.722682', '2023-11-09 15:06:43.722682', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('34eb0bfb447ad63728', 'SEEMA', NULL, 0, '', '2023-11-09 17:15:56.117622', '2023-11-09 17:15:56.117622', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c2bf44e9bb2e4c07b2', 'naksh jewels', NULL, 0, '', '2023-11-09 19:06:15.796604', '2023-11-09 19:06:15.796604', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b56e4fe610dee8beba', 'SUKCHAND', NULL, 0, '', '2023-11-10 17:18:54.799617', '2023-11-10 17:18:54.799617', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7eea27dc8077176e0c', 'SHYAMAL KOUR', NULL, 0, '', '2023-11-11 11:53:03.628587', '2023-11-11 11:53:03.628587', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a02de5926582865d09', 'badaram', NULL, 0, '', '2023-11-11 12:59:25.448470', '2023-11-11 12:59:25.448470', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c961ffa64fad9ede81', 'KUNTAL', NULL, 0, '', '2023-11-11 16:31:05.611792', '2023-11-11 16:31:05.611792', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6e13b2eb53bf8ffecf', 'KRISHNA BERA', '7760418594', 0, '', '2023-11-11 18:16:45.741542', '2023-11-11 18:16:45.741542', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e619f60185b325f473', 'PUSHPENDAR', NULL, 0, '', '2023-11-11 19:16:19.844822', '2023-11-11 19:16:19.844822', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32813c8945b29a48f7', 'PREMA', NULL, 0, '', '2023-11-11 20:13:39.145564', '2023-11-11 20:13:39.145564', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8aca6ee97f21d12704', 'NAGAR PRAMANIK', '9795437900', 0, '', '2023-11-14 11:11:35.989394', '2023-11-14 11:11:35.989394', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cc1d064777173960f1', 'VAMMUHAS', NULL, 0, '', '2023-11-14 11:35:58.505456', '2023-11-14 11:35:58.505456', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a35e2170d1cda238b', 'atanu', NULL, 0, '', '2023-11-14 16:57:08.375253', '2023-11-14 16:57:08.375253', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('93100ccd31dc7012db', 'JAMAL', NULL, 0, '', '2023-11-15 12:25:19.674362', '2023-11-15 12:25:19.674362', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('20502586679d49ed4a', 'SWANA APPA', NULL, 0, '', '2023-11-15 17:32:33.566007', '2023-11-15 17:32:33.566007', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('459d0508ee7865d62b', 'BGS', NULL, 0, '', '2023-11-15 21:48:48.469292', '2023-11-15 21:48:48.469292', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fbd1d687a46b04262b', 'SAMRESH', NULL, 0, '', '2023-11-16 12:28:10.354483', '2023-11-16 12:28:10.354483', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7a2f0daed18a1cc669', 'PRADEEP PAL', NULL, 0, '', '2023-11-16 13:18:54.685057', '2023-11-16 13:18:54.685057', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('50b2f8ccb4ddf37582', 'ABHIJEET BAIRAGI', NULL, 0, '', '2023-11-16 17:56:45.674082', '2023-11-16 17:56:45.674082', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3fd71706a4cf9ca9b2', 'S S K', NULL, 0, '', '2023-11-17 16:04:54.658934', '2023-11-17 16:04:54.658934', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('91dbedfb7f1ab5338f', 'REDDY', NULL, 0, '', '2023-11-17 18:39:22.928959', '2023-11-17 18:39:22.928959', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cadb688e5b4a2ac09e', 'S K BAPPAN', NULL, 0, '', '2023-11-17 19:31:13.198818', '2023-11-17 19:31:13.198818', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('09d4936a545b379d19', 'ANGREZ', NULL, 0, '', '2023-11-17 20:22:01.054837', '2023-11-17 20:22:01.054837', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f96e704c34f0d07699', 'nafizul', NULL, 0, '', '2023-11-18 12:29:06.481624', '2023-11-18 12:29:06.481624', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f84797a8cab2ea556d', 'astik mondal', NULL, 0, '', '2023-11-18 12:46:42.130971', '2023-11-18 12:46:42.130971', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32c1a19181e5f61556', 'SUPRIYO', NULL, 0, '', '2023-11-18 14:39:36.376793', '2023-11-18 14:39:36.376793', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('565b499c1212fced20', 'RAM KHANJI', NULL, 0, '', '2023-11-18 16:26:02.327029', '2023-11-18 16:26:02.327029', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5e8d01e96e938d0917', 'SAJAL', NULL, 0, '', '2023-11-20 13:19:06.300522', '2023-11-20 13:19:06.300522', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('28c83bfb63cb00da47', 'INDAR', NULL, 0, '', '2023-11-20 14:57:19.788840', '2023-11-20 14:57:19.788840', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d37d75e4dea1bcfb58', 'NIRANJAN', NULL, 30, '', '2023-11-20 17:08:28.531846', '2023-11-20 17:08:28.531846', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ebb4f1621720662428', 'nayaz', NULL, 0, '', '2023-11-20 20:44:39.426931', '2023-11-20 20:44:39.426931', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c6a78dac083c7ccc13', 'JEET', NULL, 0, '', '2023-11-22 10:27:33.015041', '2023-11-22 10:27:33.015041', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ed234ac6f4be1ca89c', 'RAMESH MAJI', NULL, 0, '', '2023-11-22 13:13:52.829038', '2023-11-22 13:13:52.829038', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('64868a2bf22824548a', 'mamon', NULL, 0, '', '2023-11-22 18:39:44.161235', '2023-11-22 18:39:44.161235', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f66b1412d85fe8d3b2', 'piru', NULL, 0, '', '2023-11-22 19:01:52.697477', '2023-11-22 19:01:52.697477', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ae07f8d2481b73fc20', 'asif mondal', NULL, 0, '', '2023-11-22 19:11:39.018559', '2023-11-22 19:11:39.018559', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('408ad8b61ee5a9a290', 'nithaye manna', NULL, 0, '', '2023-11-22 20:40:43.148314', '2023-11-22 20:40:43.148314', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bec93a20ba71367e33', 'SRI GANESH', NULL, 0, '', '2023-11-23 20:59:53.561355', '2023-11-23 20:59:53.561355', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e87a72cb14f5e0b059', 'MANISHA', NULL, 0, '', '2023-11-24 13:28:12.120922', '2023-11-24 13:28:12.120922', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b70caf77dca99b7ceb', 'GOURANG MONDAL', NULL, 0, '', '2023-11-24 19:18:24.052557', '2023-11-24 19:18:24.052557', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ff440d4b30f78599b8', 'UNENEDU', NULL, 0, '', '2023-11-24 20:45:25.956422', '2023-11-24 20:45:25.956422', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('03916611dd18ef7f43', 'ARYAN', NULL, 0, '', '2023-11-25 12:42:27.885217', '2023-11-25 12:42:27.885217', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9b84f9b822c1db8deb', 'K V G', NULL, 0, '', '2023-11-25 16:49:33.249982', '2023-11-25 16:49:33.249982', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8fc7e4b5641eac760a', 'TUTUN', NULL, 0, '', '2023-11-25 16:50:57.538534', '2023-11-25 16:50:57.538534', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9c082bded6ffdaf9c1', 'MONOJEET DAMALI', NULL, 0, '', '2023-11-25 16:54:03.955057', '2023-11-25 16:54:03.955057', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('48169e6a69a25421eb', 'SHEK SUMAN ALI', NULL, 0, '', '2023-11-25 19:24:35.135080', '2023-11-25 19:24:35.135080', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('49d963c3c9619da2a6', 'YASIR', NULL, 0, '', '2023-11-25 20:15:23.099495', '2023-11-25 20:15:23.099495', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3513e7d06ee192d22b', 'SK JEWELS', NULL, 0, '', '2023-11-25 20:23:26.448687', '2023-11-25 20:23:26.448687', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b05138e764584ec0ce', 'NAKUL', NULL, 0, '', '2023-11-26 13:54:16.081430', '2023-11-26 13:54:16.081430', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('deb92379790ad777f2', 'laxmi chains', NULL, 0, '', '2023-11-27 16:18:26.967306', '2023-11-27 16:18:26.967306', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f4bd4f7872ea3b6e5f', 'nagbhushan', NULL, 0, '', '2023-11-27 18:03:07.892759', '2023-11-27 18:03:07.892759', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0f6960af716835df19', 'b s  k jewel', '7483679478', 0, '', '2023-11-27 20:20:09.871256', '2023-11-27 20:20:09.871256', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37b25a9ab4b1e070b9', 'MOIN', NULL, 0, '', '2023-11-28 15:00:30.318420', '2023-11-28 15:00:30.318420', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b545ca420c79a12880', 'bharathi madam', NULL, 0, '', '2023-11-28 17:11:49.845796', '2023-11-28 17:11:49.845796', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e30c5356252398f89c', 'k n v', NULL, 0, '', '2023-11-29 18:25:11.289667', '2023-11-29 18:25:11.289667', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('64058ca3eea7d2864a', 'SHYAMAL MONDAL', NULL, 0, '', '2023-11-30 12:22:05.007032', '2023-11-30 12:22:05.007032', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b2a02237651b5c0603', 'deepika', NULL, 0, '', '2023-11-30 17:30:04.291497', '2023-11-30 17:30:04.291497', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bbb4b431b1669b1df0', 'tapas pal', NULL, 0, '', '2023-11-30 19:11:26.883030', '2023-11-30 19:11:26.883030', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bf99fb1371f32035cd', 'd;inesh das', NULL, 0, '', '2023-11-30 19:19:05.786501', '2023-11-30 19:19:05.786501', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c462b6b4d58e01d510', 'alam mandal', NULL, 0, '', '2023-11-30 21:09:45.870187', '2023-11-30 21:09:45.870187', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8fe04699df43282d0a', 'tulsi jewels', NULL, 0, '', '2023-11-30 21:17:38.630302', '2023-11-30 21:17:38.630302', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e354c943deef5439fe', 'UMA RAMESH', NULL, 0, '', '2023-12-01 11:34:31.040836', '2023-12-01 11:34:31.040836', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0cd2fa41210aa7371f', 'SUMAN MANNA', NULL, 0, '', '2023-12-01 12:20:50.387360', '2023-12-01 12:20:50.387360', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ddd585763344930cf3', 'giridhar', NULL, 0, '', '2023-12-01 15:58:44.993458', '2023-12-01 15:58:44.993458', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('20316fab188009da09', 'salam', NULL, 0, '', '2023-12-01 16:33:22.245293', '2023-12-01 16:33:22.245293', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3c3ffd8ea11ba810ed', 'CHANDHAN HAJRA', NULL, 0, '', '2023-12-02 17:25:46.659105', '2023-12-02 17:25:46.659105', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aef830c0aa56832de6', 'GOVINDA DHARA', '9738101067', 0, '', '2023-12-02 18:26:15.359820', '2023-12-02 18:26:15.359820', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3f7cdcda06fc847a46', 'DEEP CHOUHAN', NULL, 0, '', '2023-12-02 19:32:02.996034', '2023-12-02 19:32:02.996034', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa266a0fed37e9c480', 'BARUN MONDAL', NULL, 0, '', '2023-12-02 19:52:34.171237', '2023-12-02 19:52:34.171237', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1af68478519c814d87', 'BABU READY', NULL, 0, '', '2023-12-02 21:08:47.086211', '2023-12-02 21:08:47.086211', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6c2c0e51124eda50e8', 'MAMAN', NULL, 0, '', '2023-12-02 21:13:36.658876', '2023-12-02 21:13:36.658876', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b2bb3be0b4f5c02cf8', 'BAPPA MAJI', NULL, 0, '', '2023-12-03 11:13:01.901898', '2023-12-03 11:13:01.901898', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f60c0d8dfa45709058', 'R GOLD', NULL, 0, '', '2023-12-03 12:16:33.615407', '2023-12-03 12:16:33.615407', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e00ad853e1e28961de', 'VATSALA', NULL, 0, '', '2023-12-03 12:24:44.960103', '2023-12-03 12:24:44.960103', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('57c605747e82c9b2bb', 'SHIRVASH', NULL, 0, '', '2023-12-03 14:06:41.985609', '2023-12-03 14:06:41.985609', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4fef194edf421bc531', 'PRASHANJEET KHANRA', NULL, 0, '', '2023-12-04 10:55:38.113881', '2023-12-04 10:55:38.113881', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1379d1a260dcb94f38', 'MRUNALINI', NULL, 0, '', '2023-12-04 12:02:02.835605', '2023-12-04 12:02:02.835605', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('39b493e8058d157270', 'SHAKIB', NULL, 0, '', '2023-12-04 18:55:01.466576', '2023-12-04 18:55:01.466576', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f6061729b9ae537143', 'JAGADEESH GAGRA', '9945331116', 0, '', '2023-12-04 18:56:59.260560', '2023-12-04 18:56:59.260560', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cf597a901ab8fb5e15', 'JALODHAR', NULL, 0, '', '2023-12-05 15:10:55.867702', '2023-12-05 15:10:55.867702', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2cbb502d7026de39e7', 'DINESH JAIN', NULL, 0, '', '2023-12-05 15:14:06.658269', '2023-12-05 15:14:06.658269', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('17f734010f06aac55f', 'SK MAJARUL', NULL, 0, '', '2023-12-05 17:35:35.121757', '2023-12-05 17:35:35.121757', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fa0e1581f8935af737', 'ARIMDHAM', NULL, 0, '', '2023-12-05 17:44:54.578911', '2023-12-05 17:44:54.578911', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('afe929e7c0366bbe22', 'UTTAM MALO', NULL, 0, '', '2023-12-06 12:49:13.498948', '2023-12-06 12:49:13.498948', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f28f9c8a28af80b142', 'PREETHI', NULL, 0, '', '2023-12-06 13:24:01.524335', '2023-12-06 13:24:01.524335', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f9f8abbf1dcfec612a', 'SAYED TOUSIF', NULL, 0, '', '2023-12-06 13:25:21.892855', '2023-12-06 13:25:21.892855', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5701e77c1487f44a3a', 'JAYDEEP', NULL, 0, '', '2023-12-06 16:07:41.432259', '2023-12-06 16:07:41.432259', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9b1b33476288c54e78', 'SUJAI PANDIT', NULL, 0, '', '2023-12-06 18:41:13.794831', '2023-12-06 18:41:13.794831', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('deaefabc3a27f84f8d', 'GOUTHAM SOMANTHU', NULL, 0, '', '2023-12-06 19:49:18.349313', '2023-12-06 19:49:18.349313', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8300b308cbc465f1c3', 'SAYED', NULL, 0, '', '2023-12-06 20:06:47.665556', '2023-12-06 20:06:47.665556', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5353d0e23131d3c038', 'samuel mandal', NULL, 0, '', '2023-12-06 20:30:39.256896', '2023-12-06 20:30:39.256896', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('391faa1eec7867030e', 'satinath', NULL, 0, '', '2023-12-06 21:17:39.258673', '2023-12-06 21:17:39.258673', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('44706ba30fec952c26', 'NAVARTHAN JWELES', NULL, 0, '', '2023-12-07 15:39:50.135494', '2023-12-07 15:39:50.135494', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1239980bae8ed3cddb', 'SAMUEL MONDAL', NULL, 0, '', '2023-12-07 15:46:10.408634', '2023-12-07 15:46:10.408634', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('747357be52546aa809', 'PADAM BADERA', NULL, 0, '', '2023-12-07 18:11:22.124522', '2023-12-07 18:11:22.124522', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8244597317970b1219', 'UTPAL MANDAL', NULL, 0, '', '2023-12-08 13:46:02.300599', '2023-12-08 13:46:02.300599', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e8b64692c9f2b6a285', 'BISWAJEET PATRA', NULL, 0, '', '2023-12-08 18:01:11.552667', '2023-12-08 18:01:11.552667', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('18ed06a069ebd37a86', 'BAPPI SUJEET', NULL, 0, '', '2023-12-08 18:34:13.387333', '2023-12-08 18:34:13.387333', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('560b5955cf7ec3402b', 'lobdas', '9901334862', 0, '', '2023-12-09 10:41:25.905463', '2023-12-09 10:41:25.905463', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('11427ffa18e02d199d', 'DEEPANKAR DAS', '9740421802', 0, '', '2023-12-09 13:18:24.187603', '2023-12-09 13:18:24.187603', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('18fc34402c34c17479', 'RINTU MAHISAL', NULL, 0, '', '2023-12-09 15:14:06.295490', '2023-12-09 15:14:06.295490', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('91abb27896c0093a1c', 'PARTHO SAWANTHO', NULL, 0, '', '2023-12-09 18:30:32.892729', '2023-12-09 18:30:32.892729', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('622eeba18870f89607', 'MHD HAROON', NULL, 0, '', '2023-12-09 20:11:34.753828', '2023-12-09 20:11:34.753828', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6b071b483a28911020', 'MR SANKETH', NULL, 0, '', '2023-12-10 11:58:34.829325', '2023-12-10 11:58:34.829325', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4ed00a5a43c6dad91c', 'SANTU PATRA', '8918511877', 0, '', '2023-12-10 12:31:56.751110', '2023-12-10 12:31:56.751110', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('54d230899c090bb67f', 'DUTH KUMAR', NULL, 0, '', '2023-12-10 14:25:45.907923', '2023-12-10 14:25:45.907923', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('86f85991d5ae758712', 'BAPPA', NULL, 0, '', '2023-12-11 12:26:28.113613', '2023-12-11 12:26:28.113613', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5866fb31f308e4d719', 'SHARUKH', NULL, 0, '', '2023-12-11 13:23:39.052179', '2023-12-11 13:23:39.052179', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fe434ff386d524b6b5', 'DEVANSH', NULL, 0, '', '2023-12-11 14:15:50.737169', '2023-12-11 14:15:50.737169', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5e5a5c5ca722cb56a1', 'dalhim', NULL, 0, '', '2023-12-11 18:47:52.172076', '2023-12-11 18:47:52.172076', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('074bc5305bef56637f', 'SRIKANTH BAURI', NULL, 0, '', '2023-12-12 12:15:15.336509', '2023-12-12 12:15:15.336509', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9b9f63dcf22b8d10c6', 'HARI PADU DAS', NULL, 0, '', '2023-12-12 12:17:40.745435', '2023-12-12 12:17:40.745435', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7ef0feba00c80396f6', 'CHAWLA', NULL, 0, '', '2023-12-12 12:48:15.673583', '2023-12-12 12:48:15.673583', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37bffb7edba8147037', 'mpb', NULL, 0, '', '2023-12-12 16:37:00.015801', '2023-12-12 16:37:00.015801', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2abe05ded39d29944c', 'arun bera', NULL, 0, '', '2023-12-12 16:47:43.283051', '2023-12-12 16:47:43.283051', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('74a913677f6bb4a817', 'M M', NULL, 0, '', '2023-12-13 14:03:56.088319', '2023-12-13 14:03:56.088319', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dd854957b04a273eac', 'DEBU PAL', NULL, 0, '', '2023-12-13 18:48:47.435950', '2023-12-13 18:48:47.435950', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d46d17be5f2d10aa31', 'BALAI SHARMA', NULL, 0, '', '2023-12-13 19:01:51.482446', '2023-12-13 19:01:51.482446', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('61c5ad2dba02786ee4', 'GADAI', NULL, 0, '', '2023-12-13 19:04:02.500716', '2023-12-13 19:04:02.500716', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('56a6dce2d77a5198f3', 'SAPAN MAJI', '9110808826', 0, '', '2023-12-13 20:25:35.024857', '2023-12-13 20:25:35.024857', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7987b3ce80bf23ba33', 'SHIVANNA', NULL, 0, '', '2023-12-14 11:57:45.741335', '2023-12-14 11:57:45.741335', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('27173ade6c773b2d7f', 'SANDEEP VISHWAS', NULL, 0, '', '2023-12-14 12:42:50.793364', '2023-12-14 12:42:50.793364', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5265d8b73969664e69', 'GANPATH', NULL, 0, '', '2023-12-14 13:10:26.780707', '2023-12-14 13:10:26.780707', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e25404f7eef9676f6a', 'VINTI', NULL, 0, '', '2023-12-14 14:23:51.604486', '2023-12-14 14:23:51.604486', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d6125fb64739292f6d', 'SHABHINDRA', NULL, 0, '', '2023-12-14 16:03:16.597240', '2023-12-14 16:03:16.597240', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d17b10576bca5de6c', 'B  S P', NULL, 0, '', '2023-12-14 16:56:33.075074', '2023-12-14 16:56:33.075074', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3c28f347c01d3829b8', 'arvind midya', '7338168905', 0, '', '2023-12-14 20:58:03.699663', '2023-12-14 20:58:03.699663', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4ab70f09f4b2bccc18', 'jeet', NULL, 0, '', '2023-12-15 09:51:24.473667', '2023-12-15 09:51:24.473667', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8b697e0473eb847f0e', 'amith datta', NULL, 0, '', '2023-12-15 18:32:03.364719', '2023-12-15 18:32:03.364719', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('00d3c35af06f0d154f', 'arup manna', '8088990637', 0, '', '2023-12-16 11:19:56.264791', '2023-12-16 11:19:56.264791', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('18abc7515d8c9e7b81', 'M MALIK', NULL, 0, '', '2023-12-17 11:37:14.890814', '2023-12-17 11:37:14.890814', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('489883af60f46a0d75', 'AMAR', NULL, 0, '', '2023-12-17 12:07:05.401122', '2023-12-17 12:07:05.401122', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c90156370e1f437cb7', 'deb patro metya', NULL, 0, '', '2023-12-17 13:21:54.875568', '2023-12-17 13:21:54.875568', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('041a08a75b1dcea598', 'SOW SHWETHA', NULL, 0, '', '2023-12-18 10:51:01.664166', '2023-12-18 10:51:01.664166', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b292de3163f0b6f06c', 'DEBARANGA', NULL, 0, '', '2023-12-18 11:55:46.972626', '2023-12-18 11:55:46.972626', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c127e51b05f59b6f95', 'SURREN', NULL, 0, '', '2023-12-18 19:33:59.102844', '2023-12-18 19:33:59.102844', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3c156b9f8c2f0d8e08', 'sudndhar raj', NULL, 0, '', '2023-12-18 19:51:38.735304', '2023-12-18 19:51:38.735304', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62687ccc291515e1c9', 'DEB METYA', NULL, 0, '', '2023-12-18 20:37:20.954437', '2023-12-18 20:37:20.954437', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d2314fff0ecb897aec', 'razzas', NULL, 0, '', '2023-12-19 18:03:34.327680', '2023-12-19 18:03:34.327680', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d3b8d3865ef4269700', 'bikas da', NULL, 0, '', '2023-12-19 19:00:08.735992', '2023-12-19 19:00:08.735992', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3ca3c657e30f135b6a', 'v j c', NULL, 0, '', '2023-12-19 19:22:16.039763', '2023-12-19 19:22:16.039763', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f1a45cb9071f3ad11a', 'POORNA DAS', NULL, 0, '', '2023-12-20 12:03:21.436652', '2023-12-20 12:03:21.436652', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('74ea6c5affd92a055e', 'ASHIQUE', NULL, 0, '', '2023-12-20 13:53:02.546509', '2023-12-20 13:53:02.546509', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('833a5332cd196d9718', 'TARAK SINGH', NULL, 0, '', '2023-12-20 14:05:21.154511', '2023-12-20 14:05:21.154511', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6d9a738dcb8aa859d3', 'majid', NULL, 0, '', '2023-12-20 18:04:57.640092', '2023-12-20 18:04:57.640092', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('afd54f4508763daedb', 'AMUL MAITHI', NULL, 0, '', '2023-12-21 10:38:05.541638', '2023-12-21 10:38:05.541638', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('87904d8de710704bd9', 'BOLAI SHARMA', NULL, 0, '', '2023-12-21 15:25:32.826446', '2023-12-21 15:25:32.826446', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ecba4215ea4130e1fc', 'N J C T', NULL, 0, '', '2023-12-21 15:37:52.691183', '2023-12-21 15:37:52.691183', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('081f6c83bde8832ad3', 'ABHIJEET MANDAL', '9108658874', 0, '', '2023-12-21 21:08:38.917312', '2023-12-21 21:08:38.917312', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a7992e63535d25374', 'sukumar sawantho', NULL, 0, '', '2023-12-22 11:34:06.033260', '2023-12-22 11:34:06.033260', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7f9263b24548f53473', 'parithosh', NULL, 0, '', '2023-12-22 12:27:39.799235', '2023-12-22 12:27:39.799235', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('55f76551371d2a52eb', 'm k', NULL, 0, '', '2023-12-22 13:20:50.085128', '2023-12-22 13:20:50.085128', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0818a92a8cfb121779', 'AVINASH', NULL, 0, '', '2023-12-23 14:01:24.361032', '2023-12-23 14:01:24.361032', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1e84ab3e5437b118f1', 'SONAMONI BERA', NULL, 0, '', '2023-12-23 15:15:12.124578', '2023-12-23 15:15:12.124578', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('089b09afeb43116eac', 'SAMIR ROY', '7892195086', 0, '', '2023-12-23 20:21:24.449993', '2023-12-23 20:21:24.449993', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8f5798c89d3d0147f3', 'MANDEEP', NULL, 0, '', '2023-12-24 13:04:34.761505', '2023-12-24 13:04:34.761505', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('49e32d61e6c0b407fc', 'pradeep nandi', NULL, 0, '', '2023-12-25 12:51:16.072935', '2023-12-25 12:51:16.072935', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3e6c9246e7878befb0', 'prabhu', NULL, 0, '', '2023-12-25 13:39:44.192578', '2023-12-25 13:39:44.192578', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('861905c78ac5bfcffd', 'baneshwar', NULL, 0, '', '2023-12-25 14:23:25.782876', '2023-12-25 14:23:25.782876', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('daab6b9d0dca24f397', 'sk amir', NULL, 0, '', '2023-12-25 16:35:48.601843', '2023-12-25 16:35:48.601843', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c1be4772405be36cd0', 'bhuvan', NULL, 0, '', '2023-12-25 19:18:43.108943', '2023-12-25 19:18:43.108943', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('43ac7e3e41fe910495', 'SAGAR DAS', '9148854892', 0, '', '2023-12-26 10:52:42.282621', '2023-12-26 10:52:42.282621', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2e889b38f7c0ba63b5', 'PADAM', NULL, 0, '', '2023-12-26 11:38:57.603572', '2023-12-26 11:38:57.603572', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8bedce1d7d5459a295', 'GOUR SHAH', NULL, 0, '', '2023-12-26 12:44:30.891784', '2023-12-26 12:44:30.891784', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3856a990e167d64053', 'PRASHANJEET KHAR', NULL, 0, '', '2023-12-26 12:47:52.275696', '2023-12-26 12:47:52.275696', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('799f24b305fc0d1e0c', 'S K BAPAN', '8073715020', 0, '', '2023-12-26 21:35:46.094754', '2023-12-26 21:35:46.094754', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ce81b7062f551a3c11', 'KINKAR MAJI', '8105509211', 0, '', '2023-12-27 11:00:28.682328', '2023-12-27 11:00:28.682328', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7390552205f2a94c25', 'r v r', NULL, 0, '', '2023-12-27 13:33:35.517854', '2023-12-27 13:33:35.517854', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0acbb63b32358e741d', 'prahaat  bera', '7738286959', 0, '', '2023-12-27 14:11:42.754899', '2023-12-27 14:11:42.754899', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('11e3a294eadb976c69', 'prasanjeet sawantho', NULL, 0, '', '2023-12-27 14:12:58.700409', '2023-12-27 14:12:58.700409', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('446fc9964dbb2005df', 'babu da', NULL, 0, '', '2023-12-27 18:21:11.212350', '2023-12-27 18:21:11.212350', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('49114cb087ab4456d1', 'hj', NULL, 0, '', '2023-12-27 20:59:23.717373', '2023-12-27 20:59:23.717373', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('392300d3e78019f4da', 'kasim', NULL, 0, '', '2023-12-28 14:31:17.411470', '2023-12-28 14:31:17.411470', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('58a98d8991321ac6e6', 'mars', NULL, 0, '', '2023-12-28 16:15:33.478602', '2023-12-28 16:15:33.478602', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('585eb0db8de31653c0', 'prashnjeet sawantho', NULL, 0, '', '2023-12-28 16:27:57.661887', '2023-12-28 16:27:57.661887', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('11d05a0c06a74a657f', 'K R H S', NULL, 0, '', '2023-12-29 11:21:05.526604', '2023-12-29 11:21:05.526604', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c9202ae97f91493c9', 'n j m', NULL, 0, '', '2023-12-29 12:09:11.035669', '2023-12-29 12:09:11.035669', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1507707be6e0fc948f', 'RINTU MAHISA', NULL, 0, '', '2023-12-29 12:21:29.087167', '2023-12-29 12:21:29.087167', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('79c0f786b5fa199f8a', 'PREM J', NULL, 0, '', '2023-12-29 16:20:11.771243', '2023-12-29 16:20:11.771243', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8a0541ccce26cc5cd1', 'P DAS', NULL, 0, '', '2023-12-30 12:01:02.249830', '2023-12-30 12:01:02.249830', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('994f6fdd438b615d82', 'BAPPAN SK', NULL, 0, '', '2023-12-30 12:07:33.010861', '2023-12-30 12:07:33.010861', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0dceb3b1be3073d0da', 'JAY DEEP', NULL, 0, '', '2023-12-30 13:05:02.629444', '2023-12-30 13:05:02.629444', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2cecb3a61a34917e54', 'K MAITHYE', NULL, 0, '', '2023-12-30 17:50:23.993911', '2023-12-30 17:50:23.993911', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('592f150137287aaf7a', 'RVR', NULL, 0, '', '2023-12-30 20:05:31.010526', '2023-12-30 20:05:31.010526', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9ea7361d403d889f80', 'rupak', NULL, 0, '', '2023-12-31 10:11:17.974226', '2023-12-31 10:11:17.974226', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('604664e47a583009db', 'NARAYAN', NULL, 0, '', '2023-12-31 12:33:09.099377', '2023-12-31 12:33:09.099377', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('60a221a3dbc0ab165e', 'MANTOSH', NULL, 0, '', '2023-12-31 13:57:04.350664', '2023-12-31 13:57:04.350664', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5f968ad63c51155160', 'TOPCO  ZAM ZAM', NULL, 0, '', '2024-01-01 19:04:07.119818', '2024-01-01 19:04:07.119818', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eb6a95b1bfaef6c595', 'JHONY DA', NULL, 0, '', '2024-01-01 19:36:19.586325', '2024-01-01 19:36:19.586325', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d993ee0752455dc2ed', 'SOMA', NULL, 0, '', '2024-01-02 16:12:38.939501', '2024-01-02 16:12:38.939501', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4a2a493346271d50e7', 'manathosh', NULL, 0, '', '2024-01-02 17:11:57.605184', '2024-01-02 17:11:57.605184', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('54dfa8a764732bc4f0', 'JYOTHI', NULL, 0, '', '2024-01-03 10:55:09.659632', '2024-01-03 10:55:09.659632', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9b635ac947a07a29d8', 'DEBU MONDAL', NULL, 0, '', '2024-01-03 12:07:47.212912', '2024-01-03 12:07:47.212912', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('210d74593d8192dddc', 'ranjeet bera', NULL, 0, '', '2024-01-03 12:18:58.197670', '2024-01-03 12:18:58.197670', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2df42d77b6c6e587ee', 'srinath', NULL, 0, '', '2024-01-03 12:50:16.464559', '2024-01-03 12:50:16.464559', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('878299f6719104929e', 'rajiv mete', NULL, 0, '', '2024-01-03 13:14:45.176077', '2024-01-03 13:14:45.176077', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8c8c249d86e49a8261', 'moliye mandal', '9742832805', 0, '', '2024-01-03 13:51:58.604364', '2024-01-03 13:51:58.604364', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('15eaec635a8301daa1', 'RAJKUMAR', NULL, 0, '', '2024-01-04 14:18:53.257743', '2024-01-04 14:18:53.257743', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('16903cab899f495e78', 'SRIKANTH GATA', NULL, 0, '', '2024-01-04 19:39:19.587359', '2024-01-04 19:39:19.587359', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32fec549ed647bea98', 'ILIYAS', NULL, 0, '', '2024-01-05 10:29:56.906717', '2024-01-05 10:29:56.906717', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ba5db2ccdd9c3cbe8', 'BSP LOKNATH', NULL, 0, '', '2024-01-05 13:51:14.857651', '2024-01-05 13:51:14.857651', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('00ea5dcbb84c63209d', 'SHEIKH SHAMSUDIN', '8088668624', 0, '', '2024-01-05 17:12:09.417560', '2024-01-05 17:12:09.417560', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f1d9e9562ff090aec2', 'BHASKAR PAL', NULL, 0, '', '2024-01-05 18:47:32.252648', '2024-01-05 18:47:32.252648', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7bab06a70c492d51ec', 'SATYANATH MONDAL', NULL, 30, '', '2024-01-05 19:12:40.629849', '2024-01-05 19:12:40.629849', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('82ea83c967766604b2', 'PRASHANJEET DHARA', NULL, 0, '', '2024-01-05 20:37:09.612147', '2024-01-05 20:37:09.612147', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7fa97594bbd5bb5055', 'SREEDHAR', NULL, 0, '', '2024-01-05 20:38:18.340083', '2024-01-05 20:38:18.340083', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f3da237f9a871f5c15', 'SUPARNA MANDAL', NULL, 0, '', '2024-01-06 12:07:04.146403', '2024-01-06 12:07:04.146403', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('90680d02666f843eeb', 'prashanjeet das', NULL, 0, '', '2024-01-06 14:15:25.298697', '2024-01-06 14:15:25.298697', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('801ec063c881e14edf', 'bappi shah', NULL, 0, '', '2024-01-06 14:32:48.387647', '2024-01-06 14:32:48.387647', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1ec9d11bbc7d84cdbd', 'premanand', NULL, 0, '', '2024-01-06 15:19:00.582191', '2024-01-06 15:19:00.582191', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4546098eedbd9c6fec', 'pradeep naji', NULL, 0, '', '2024-01-06 16:42:13.271803', '2024-01-06 16:42:13.271803', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e0fe2b3b0619615c51', 'a m', NULL, 0, '', '2024-01-06 17:05:34.185814', '2024-01-06 17:05:34.185814', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2d2fea323d9e8915b7', 'nithai karmakar', NULL, 0, '', '2024-01-06 17:33:27.121256', '2024-01-06 17:33:27.121256', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a07adf482a515fc789', 'b s p lokanth', NULL, 0, '', '2024-01-06 18:29:05.350116', '2024-01-06 18:29:05.350116', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d09c5fd55dbd5e8ee1', 'shabhir ali', NULL, 0, '', '2024-01-06 18:56:40.772626', '2024-01-06 18:56:40.772626', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7d159d46cb95fa0830', 'mrinal', NULL, 0, '', '2024-01-06 20:16:41.880972', '2024-01-06 20:16:41.880972', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('438c40d6b83b98d1a2', 'pralai', NULL, 0, '', '2024-01-06 20:27:26.682206', '2024-01-06 20:27:26.682206', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('94eb08bd81eb8657b2', 'anup + prakash', NULL, 0, '', '2024-01-06 21:04:28.708249', '2024-01-06 21:04:28.708249', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('15cb7364c2a11f35bf', 'VLJ', NULL, 0, '', '2024-01-07 10:33:59.011463', '2024-01-07 10:33:59.011463', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8bad5a586ac527b97e', 'RASEDA', NULL, 0, '', '2024-01-07 13:12:52.385697', '2024-01-07 13:12:52.385697', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('439f2e2f6b21a384f5', 'LOK DAS', NULL, 0, '', '2024-01-08 10:44:23.196976', '2024-01-08 10:44:23.196976', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('97b2a5abd4c9611081', 'SALMA', NULL, 0, '', '2024-01-09 12:40:00.956263', '2024-01-09 12:40:00.956263', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('01a792d34d1c0e411e', 'K C J', NULL, 0, '', '2024-01-09 19:28:46.152783', '2024-01-09 19:28:46.152783', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('215f8d2111f80e9cc3', 'ZAHIRUL', NULL, 0, '', '2024-01-10 11:22:26.985843', '2024-01-10 11:22:26.985843', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dffd5df04008207a04', 'KAUSHAL', NULL, 0, '', '2024-01-10 15:08:26.772359', '2024-01-10 15:08:26.772359', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0c76ceeb9036ee7ced', 'THAKUR', NULL, 0, '', '2024-01-10 16:50:31.870038', '2024-01-10 16:50:31.870038', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('504beed1c77b430431', 'GOUTHAM HAIT', NULL, 0, '', '2024-01-10 17:10:49.959576', '2024-01-10 17:10:49.959576', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ca2f7e5cb576e0fc7f', 'ARUP BOMIK', '9883356635', 0, '', '2024-01-11 11:36:43.071241', '2024-01-11 11:36:43.071241', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a89137dcc042f9cc74', 'SALMAN', NULL, 0, '', '2024-01-11 17:51:39.229575', '2024-01-11 17:51:39.229575', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a9a145008296be37f7', 'ABHI  MANIK', '6363325874', 0, '', '2024-01-11 20:14:28.191693', '2024-01-11 20:14:28.191693', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea2b77524944590743', 'DIP', NULL, 0, '', '2024-01-11 20:15:40.262689', '2024-01-11 20:15:40.262689', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f47977b75002d9791b', 'UGAM RAJ', NULL, 0, '', '2024-01-12 17:10:46.441527', '2024-01-12 17:10:46.441527', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f6bd951ec8130b1597', 'RAJU GHYIA', NULL, 0, '', '2024-01-13 12:34:38.477956', '2024-01-13 12:34:38.477956', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f7069f224dfd5d4fde', 'ratnadeep', NULL, 0, '', '2024-01-13 13:11:41.942059', '2024-01-13 13:11:41.942059', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('38ba2971c432d25191', 's s j', NULL, 0, '', '2024-01-13 19:23:11.375599', '2024-01-13 19:23:11.375599', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3bc174805bb4c784b1', 'sintu mondal', NULL, 0, '', '2024-01-13 20:20:45.814110', '2024-01-13 20:20:45.814110', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('297a3bb604abd8269e', 'raza das', NULL, 0, '', '2024-01-13 21:43:39.738406', '2024-01-13 21:43:39.738406', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8b7ecb496c4144b6cb', 'HARISH KUMAR', NULL, 0, '', '2024-01-14 14:15:49.374158', '2024-01-14 14:15:49.374158', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('241cc2f9f4eadfbc00', 'SHUBHOJEET', NULL, 0, '', '2024-01-14 14:37:04.774861', '2024-01-14 14:37:04.774861', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c2e03903e68d47dbb', 'SRI RAM', NULL, 0, '', '2024-01-15 11:05:03.180259', '2024-01-15 11:05:03.180259', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9c9b9bf93c21faeb6b', 'JIGAR B1', NULL, 0, '', '2024-01-15 11:47:59.669799', '2024-01-15 11:47:59.669799', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('22711c553a232c83fc', 'koushal', NULL, 0, '', '2024-01-15 12:23:51.588378', '2024-01-15 12:23:51.588378', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b7883eb1abfa613713', 'svr', NULL, 0, '', '2024-01-15 20:25:36.587339', '2024-01-15 20:25:36.587339', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('db3ad617fbd834f9c4', 'ajith das', '6362691334', 0, '', '2024-01-15 21:07:26.380434', '2024-01-15 21:07:26.380434', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b1b99efa99ef5dd868', 'jeeth', NULL, 0, '', '2024-01-16 10:19:44.618145', '2024-01-16 10:19:44.618145', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c27864e2137052ce0', 'uma shankar', NULL, 0, '', '2024-01-16 12:28:37.749102', '2024-01-16 12:28:37.749102', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e1917aeedd7f9a8ed1', 'sabitha', NULL, 0, '', '2024-01-16 12:29:08.445043', '2024-01-16 12:29:08.445043', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bc0be2405b94ecec23', 'paglu', NULL, 0, '', '2024-01-16 12:51:31.750885', '2024-01-16 12:51:31.750885', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('194538d2a2863dfefd', 'm j b', NULL, 0, '', '2024-01-16 13:11:48.145351', '2024-01-16 13:11:48.145351', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('599c1090079d27d342', 'arun bhai', NULL, 0, '', '2024-01-16 13:33:47.579085', '2024-01-16 13:33:47.579085', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9a2d5ab707cd476374', 'ABHI MANIK', NULL, 0, '', '2024-01-16 13:44:17.909356', '2024-01-16 13:44:17.909356', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('078e022c171cf7bb61', 's k zahir', NULL, 0, '', '2024-01-16 20:00:43.268787', '2024-01-16 20:00:43.268787', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c84182c31f98ad07fd', 'DEEPANDU', NULL, 0, '', '2024-01-17 17:59:13.862487', '2024-01-17 17:59:13.862487', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b1211f3585873b56c2', 'SURJEET PANJA', NULL, 0, '', '2024-01-17 21:17:14.741226', '2024-01-17 21:17:14.741226', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d658d817dbaa7472a1', 'RAKSHIT', NULL, 0, '', '2024-01-18 12:44:49.818719', '2024-01-18 12:44:49.818719', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e79f7c1c3f06d6f259', 'SAPAN JANA', NULL, 0, '', '2024-01-18 13:45:15.081060', '2024-01-18 13:45:15.081060', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('64015c634cb65783a3', 'SANATHAN', NULL, 0, '', '2024-01-18 18:27:39.560522', '2024-01-18 18:27:39.560522', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cddfd151bda533bcb9', 'SRIKANTH PANJA', '8553374805', 0, '', '2024-01-18 19:08:49.111426', '2024-01-18 19:08:49.111426', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dcf00015b95f4ff26c', 'BIKRAM JIN', '9019253097', 0, '', '2024-01-18 19:22:40.308482', '2024-01-18 19:22:40.308482', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('56ad24119047bac518', 'SANJAY DINDA', '7908780906', 0, '', '2024-01-18 19:24:30.235118', '2024-01-18 19:24:30.235118', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('121f7240bc3648b0c5', 'SANJAY RAUT', NULL, 0, '', '2024-01-22 11:34:55.644717', '2024-01-22 11:34:55.644717', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bab39162173a90ddd9', 'DEB PATRO SINGHA', '8158956613', 0, '', '2024-01-22 12:26:31.406407', '2024-01-22 12:26:31.406407', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b41250acf2aa8e595d', 'ALEEM', NULL, 0, '', '2024-01-22 19:39:14.670402', '2024-01-22 19:39:14.670402', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('676644f6f98f3e9c9d', 'SAMARESH', NULL, 0, '', '2024-01-22 19:53:40.856270', '2024-01-22 19:53:40.856270', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d2657834f8f26ddcc', 'RITAN', NULL, 0, '', '2024-01-22 20:15:54.969329', '2024-01-22 20:15:54.969329', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('da7d8acb669daa8a07', 'DEEP PRADHAN', '8001850032', 0, '', '2024-01-23 10:38:52.112113', '2024-01-23 10:38:52.112113', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c34aece8cae91e555b', 'hansar ali', '6295672895', 0, '', '2024-01-23 13:33:32.561378', '2024-01-23 13:33:32.561378', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7ea1cfe04085abd4c7', 'satinath monda;', '9663221250', 0, '', '2024-01-23 14:01:18.333653', '2024-01-23 14:01:18.333653', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ae733c8ef18dc89dca', 's g b', NULL, 0, '', '2024-01-23 15:36:25.323432', '2024-01-23 15:36:25.323432', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cba1b66fe10f4e1232', 'bharathi', NULL, 0, '', '2024-01-23 17:25:32.989162', '2024-01-23 17:25:32.989162', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('93e4e32531a961ba7e', 'ASHISH MANDAL', '6361189755', 0, '', '2024-01-24 11:02:58.391511', '2024-01-24 11:02:58.391511', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7bbe73c63860fd9680', 'KRHINAJI ROA', NULL, 0, '', '2024-01-24 11:26:26.921071', '2024-01-24 11:26:26.921071', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6cc2e977d265386760', 'JAIPUR GEMS', NULL, 0, '', '2024-01-24 14:08:09.818876', '2024-01-24 14:08:09.818876', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a83f810436c01e4ada', 'ISHWARA JEWELS', NULL, 0, '', '2024-01-24 14:30:17.460408', '2024-01-24 14:30:17.460408', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0c974c7a39be30d425', 'NIRMAL GUHYIA', '8073724748', 0, '', '2024-01-24 18:29:00.945285', '2024-01-24 18:29:00.945285', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5c6ea2655bb7638eb9', 'asmaul ali', '9743387072', 0, '', '2024-01-24 18:54:52.896544', '2024-01-24 18:54:52.896544', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('770682e80d68962eb5', 'DEBU MAITY', '7679042662', 0, '', '2024-01-25 12:16:39.248065', '2024-01-25 12:16:39.248065', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ffea3124a85e96761f', 'N J', NULL, 0, '', '2024-01-25 14:51:15.449957', '2024-01-25 14:51:15.449957', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('64cb4eb413f7195418', 'PINTU BOWL', NULL, 0, '', '2024-01-25 17:31:53.339873', '2024-01-25 17:31:53.339873', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ebc25af6ada7771896', 'MONI', NULL, 0, '', '2024-01-27 14:22:18.578868', '2024-01-27 14:22:18.578868', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b2e739f6d9441299b3', 'ABHIJEET BHATACHARYA', NULL, 0, '', '2024-01-27 14:27:16.019157', '2024-01-27 14:27:16.019157', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0808d48b5e2d2edc77', 'G J 7', NULL, 0, '', '2024-01-27 14:30:33.867856', '2024-01-27 14:30:33.867856', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2cdcb987b518f1ca3d', 'G 7 J', NULL, 0, '', '2024-01-27 14:30:45.295712', '2024-01-27 14:30:45.295712', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('961e3d61192363e657', 'LAKSHMI SADRA', NULL, 0, '', '2024-01-27 14:47:29.403229', '2024-01-27 14:47:29.403229', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d4de84eacc7a5a346', 'BABU LAL', NULL, 0, '', '2024-01-27 15:57:48.885233', '2024-01-27 15:57:48.885233', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('890fca42c09b90f8b5', 'SHAMIN SHEIKH', NULL, 0, '', '2024-01-27 17:24:53.646090', '2024-01-27 17:24:53.646090', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('993e1eae0b0460c329', 'RATHAN MAJUMDHAR', '7975188449', 0, '', '2024-01-27 20:07:31.139325', '2024-01-27 20:07:31.139325', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2f37bd11043c02847b', 'BAPPAN SHEIKH', NULL, 0, '', '2024-01-28 11:47:41.195833', '2024-01-28 11:47:41.195833', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e5c3223cc8106dcd1e', 'PRASANJEET RAI', '9538536740', 0, '', '2024-01-28 13:06:43.774726', '2024-01-28 13:06:43.774726', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aa974e5e4fbef4478d', 'SUMAN BARIK', '9593046688', 0, '', '2024-01-28 13:09:31.492428', '2024-01-28 13:09:31.492428', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aeee87a1b835c09ffe', 'SANDEEP SAU', '9019053196', 0, '', '2024-01-28 13:15:19.027283', '2024-01-28 13:15:19.027283', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('be8733b8fd4b5dd76d', 'ANUP SAMANTH', '6363337551', 0, '', '2024-01-28 13:16:14.912520', '2024-01-28 13:16:14.912520', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f9f1c1060e56a1b000', 'RAJDEEP', NULL, 0, '', '2024-01-28 14:27:49.326529', '2024-01-28 14:27:49.326529', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2cf2e6a4e49c01b60d', 'GULLU', NULL, 0, '', '2024-01-29 12:09:31.649544', '2024-01-29 12:09:31.649544', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d48a28fdf6a21c05fa', 'PREETHAM', NULL, 0, '', '2024-01-29 19:11:56.749636', '2024-01-29 19:11:56.749636', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8857ae0c9ad4a113dc', 'PALAK', NULL, 0, '', '2024-01-29 21:20:28.675397', '2024-01-29 21:20:28.675397', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('71d8dc3d5150a893a8', 'ABHIJEET BATTACHARYA', NULL, 0, '', '2024-01-30 12:15:11.144956', '2024-01-30 12:15:11.144956', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ead9f1ca18e834c807', 'RAGVENDRA JEWELS', NULL, 0, '', '2024-01-30 13:05:55.314906', '2024-01-30 13:05:55.314906', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a549cdb36ca275411', 'JHANTU PATRA', '7676140368', 0, '', '2024-01-31 11:23:20.050011', '2024-01-31 11:23:20.050011', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e5986c93ad215a134c', 'SUSHMAA', NULL, 0, '', '2024-01-31 12:22:16.390317', '2024-01-31 12:22:16.390317', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a6477e4e50f4cfdd3b', 'SHEK YAKUB', NULL, 0, '', '2024-01-31 13:28:21.149848', '2024-01-31 13:28:21.149848', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c79f3dc93cedea9e28', 'KARTHIK ROY', NULL, 0, '', '2024-01-31 14:51:38.324210', '2024-01-31 14:51:38.324210', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c04269d7eee5c02265', 'BIDHAN JANA', '8369254459', 0, '', '2024-01-31 16:32:33.334119', '2024-01-31 16:32:33.334119', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('820c8c3f4e41dac539', 'RAMESH SHIT', NULL, 0, '', '2024-01-31 17:45:49.164719', '2024-01-31 17:45:49.164719', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a82c591b0916eefa61', 'SUBHIR MAITHI', NULL, 0, '', '2024-01-31 20:13:26.051815', '2024-01-31 20:13:26.051815', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f03b096266037b5411', 'SANJEEV DAS', NULL, 0, '', '2024-01-31 21:11:15.374976', '2024-01-31 21:11:15.374976', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32c7a3f93f9d1739f6', 'BIDHA', NULL, 0, '', '2024-02-01 12:03:20.957468', '2024-02-01 12:03:20.957468', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e852fcd291a9b60ef4', 'TAPAN GHOSH', NULL, 0, '', '2024-02-01 14:05:10.640083', '2024-02-01 14:05:10.640083', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('17d62677a240b95069', 'ASLAM PASHA', NULL, 0, '', '2024-02-01 18:04:50.214227', '2024-02-01 18:04:50.214227', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('57ff2f859326248559', 'CINTU DA', NULL, 0, '', '2024-02-02 17:07:58.736768', '2024-02-02 17:07:58.736768', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4a737fbdd37f67d646', 'SUJAY PANDIT', '9916222644', 0, '', '2024-02-03 20:26:35.879220', '2024-02-03 20:26:35.879220', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ac4da981fb4f5bf4f4', 'BAWAR LAL', NULL, 0, '', '2024-02-03 20:35:13.529933', '2024-02-03 20:35:13.529933', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e1e28caa803ac9dfdb', 'aruna reddy', NULL, 0, '', '2024-02-04 15:46:48.939488', '2024-02-04 15:46:48.939488', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9debb9a1d758269964', 'nakul pramanik', NULL, 0, '', '2024-02-05 10:29:44.116960', '2024-02-05 10:29:44.116960', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bf0f56231d6d4134ea', 'trilok datta', NULL, 0, '', '2024-02-05 11:28:56.060324', '2024-02-05 11:28:56.060324', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7cafc2bf9b99dda73a', 'sharman', NULL, 0, '', '2024-02-05 12:38:53.559654', '2024-02-05 12:38:53.559654', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1c7589ed5d20aa5cc8', 'padham badera', NULL, 0, '', '2024-02-05 14:06:04.136837', '2024-02-05 14:06:04.136837', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7836ee92044ef01ca7', 'adhi rai', NULL, 0, '', '2024-02-05 14:35:55.490571', '2024-02-05 14:35:55.490571', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bf203b0131ea1d3a48', 'sjv', NULL, 0, '', '2024-02-05 16:31:25.604202', '2024-02-05 16:31:25.604202', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1d0bb8aaf878c720c8', 'gour sha', NULL, 0, '', '2024-02-05 19:49:30.262338', '2024-02-05 19:49:30.262338', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('979ef57219a6affecc', 'ROBIN JANA', '8884519131', 0, '', '2024-02-06 10:36:36.574249', '2024-02-06 10:36:36.574249', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7942363d488c0f72f3', 'BAPPI KOYLA', '7074608485', 0, '', '2024-02-06 10:53:08.265054', '2024-02-06 10:53:08.265054', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('08485475674aebc1ed', 'BUDDHA', NULL, 0, '', '2024-02-06 13:02:23.055074', '2024-02-06 13:02:23.055074', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cf7d80226e5b8ab88b', 'ESHWARA JEWELLERS', NULL, 0, '', '2024-02-07 11:17:46.193571', '2024-02-07 11:17:46.193571', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f85d6df255e810b945', 'ANMOL', NULL, 0, '', '2024-02-07 12:03:00.038387', '2024-02-07 12:03:00.038387', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('789d795f0e1c363b08', 'UDAY KUMAR', NULL, 0, '', '2024-02-07 14:41:31.075151', '2024-02-07 14:41:31.075151', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('895dba25a021f9b84f', 'JAI', NULL, 0, '', '2024-02-07 15:41:27.117994', '2024-02-07 15:41:27.117994', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d8590b6e32e455f1a', 'KRISHNAPPA M', NULL, 0, '', '2024-02-07 15:56:03.342820', '2024-02-07 15:56:03.342820', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8d69e23717a1ed3bf6', 'SANJU BHAI', NULL, 0, '', '2024-02-07 16:53:00.613457', '2024-02-07 16:53:00.613457', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1023d0652fdc02650d', 'RADHE SHYAM', NULL, 0, '', '2024-02-07 19:06:27.531904', '2024-02-07 19:06:27.531904', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3817496e3065eb00db', 'SUNIL SONI', NULL, 0, '', '2024-02-07 19:25:31.849031', '2024-02-07 19:25:31.849031', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eb3d342beb1b539533', 'MUKTAR MONDAL', NULL, 0, '', '2024-02-08 12:31:01.561623', '2024-02-08 12:31:01.561623', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d319b900e034e3aadf', 'BALIYA DIAMONDS', NULL, 0, '', '2024-02-08 13:55:23.244563', '2024-02-08 13:55:23.244563', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('db454c0863bcb78827', 'KRISHNA MALIK', '9742546293', 0, '', '2024-02-10 11:42:22.911209', '2024-02-10 11:42:22.911209', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ad8767b8c273b73854', 'NAVARATHAN JALLU', NULL, 0, '', '2024-02-10 13:23:37.315735', '2024-02-10 13:23:37.315735', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('247cd8d84199e630e8', 'JAIDEEP', NULL, 0, '', '2024-02-10 13:25:07.822811', '2024-02-10 13:25:07.822811', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c5de616bc085a02c30', 'PANDIT', NULL, 0, '', '2024-02-10 14:37:23.948877', '2024-02-10 14:37:23.948877', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f48dea6e42872bdfc0', 'SAIDA', NULL, 0, '', '2024-02-10 18:32:45.179547', '2024-02-10 18:32:45.179547', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ddcb953e164f47002e', 'GAYATHRI', NULL, 0, '', '2024-02-10 19:12:39.653281', '2024-02-10 19:12:39.653281', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e19ea06ec6bf6f960a', 'ROHAN', NULL, 0, '', '2024-02-10 19:45:44.029446', '2024-02-10 19:45:44.029446', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('92548cb58cd70e1387', 'JEEVITH', NULL, 0, '', '2024-02-10 20:46:43.708860', '2024-02-10 20:46:43.708860', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d002e89973d23833f1', 'WASI', NULL, 0, '', '2024-02-12 13:29:54.943323', '2024-02-12 13:29:54.943323', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8da44d48e4ba718183', 'ARUP SADUKA', NULL, 0, '', '2024-02-12 16:37:09.137465', '2024-02-12 16:37:09.137465', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e356109563ac25c6ac', 'GANESH  MONDAL', NULL, 0, '', '2024-02-12 16:37:44.185384', '2024-02-12 16:37:44.185384', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('998051d4b44d33449e', 'DEEPANKAR BERA', NULL, 0, '', '2024-02-12 16:57:59.340648', '2024-02-12 16:57:59.340648', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('82bc7dc808a370994a', 'ASIT GAYEN', '7547986427', 0, '', '2024-02-13 11:14:33.609251', '2024-02-13 11:14:33.609251', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bd377448b4fff12e67', 'RAMCHANDRAN', NULL, 0, '', '2024-02-13 18:43:12.300740', '2024-02-13 18:43:12.300740', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a169c28f5d83d0e8e8', 'SHYAM SUNDAR', NULL, 0, '', '2024-02-13 20:39:28.743653', '2024-02-13 20:39:28.743653', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e8681bcbc51af0e7e3', 'B A B', NULL, 0, '', '2024-02-14 12:48:04.712318', '2024-02-14 12:48:04.712318', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6cc18d962178b78a9d', 'FALAB', NULL, 0, '', '2024-02-14 13:42:08.309513', '2024-02-14 13:42:08.309513', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1819a44604bd5d1e7d', 'SANDEEP PATIL', NULL, 0, '', '2024-02-15 11:13:44.384500', '2024-02-15 11:13:44.384500', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('794262fce9d36b764a', 'PRADEEP PULKAYITH', '9735654823', 0, '', '2024-02-15 14:37:48.999550', '2024-02-15 14:37:48.999550', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1f9243de0f5e59fb3f', 'BHASKAR BHADAK', '6361587220', 0, '', '2024-02-15 14:39:33.254723', '2024-02-15 14:39:33.254723', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('95323a5d1e27b07984', 'GERU', NULL, 0, '', '2024-02-15 15:27:43.932138', '2024-02-15 15:27:43.932138', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a6c0f3d5ba88880498', 'UTPAL SADUKA', '7699250324', 0, '', '2024-02-15 18:38:12.218427', '2024-02-15 18:38:12.218427', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('04fe00048f95d3e8b7', 'AMITH JANA', NULL, 0, '', '2024-02-16 12:45:38.437181', '2024-02-16 12:45:38.437181', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1c4195a47fa2681781', 'pradhyut', NULL, 0, '', '2024-02-16 14:48:29.955407', '2024-02-16 14:48:29.955407', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d2fb10103259b70bb9', 'jbj', NULL, 0, '', '2024-02-16 19:41:06.698366', '2024-02-16 19:41:06.698366', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1efbfcb202259c80d5', 'A T R JEWELS', NULL, 0, '', '2024-02-17 12:10:17.725743', '2024-02-17 12:10:17.725743', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('8fffa5fb1038713be0', 'basudev jana a', NULL, 0, '', '2024-02-17 13:06:53.906157', '2024-02-17 13:06:53.906157', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62da59dadb62918047', 'atanu maithi', '8088760437', 0, '', '2024-02-17 14:41:42.187622', '2024-02-17 14:41:42.187622', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dc314dad6a6ad5dc38', 'rathnam chari', NULL, 0, '', '2024-02-17 15:55:17.713139', '2024-02-17 15:55:17.713139', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('49f92aeef2f87d74db', 'sushanth sawantho', NULL, 0, '', '2024-02-17 17:24:42.217435', '2024-02-17 17:24:42.217435', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7eefdb2d3fc1059376', 'SH', NULL, 0, '', '2024-02-19 19:57:44.539412', '2024-02-19 19:57:44.539412', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b92f761488f2ac5f4b', 'SOMNATH MAYITHE', '8310174461', 0, '', '2024-02-19 20:11:47.615370', '2024-02-19 20:11:47.615370', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('066f2f7e96e3c762c2', 'ARGHO  MALIK', '7718267009', 0, '', '2024-02-19 20:54:39.184483', '2024-02-19 20:54:39.184483', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c4917d28bbed061b3b', 'CHOTU BHAG', '9110274713', 0, '', '2024-02-20 11:04:27.026046', '2024-02-20 11:04:27.026046', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1ac29c18e80bd3095d', 'SURJEET DULAI', '8431787741', 0, '', '2024-02-20 11:26:41.161070', '2024-02-20 11:26:41.161070', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('310b43f4554fb5cc0a', 'ARUP MALIK', NULL, 0, '', '2024-02-21 11:30:10.136814', '2024-02-21 11:30:10.136814', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('43358e2dcf16adfa2c', 'NAVARATHAN JC', NULL, 0, '', '2024-02-21 14:53:28.077963', '2024-02-21 14:53:28.077963', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('28c8ebee9095b4d242', 'RATNAM', NULL, 0, '', '2024-02-21 17:00:45.189231', '2024-02-21 17:00:45.189231', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5f5051360f49c648cc', 'SUSHEEL', NULL, 0, '', '2024-02-21 17:57:59.190531', '2024-02-21 17:57:59.190531', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('198b575578dfdd054c', 'sidham', NULL, 0, '', '2024-02-21 19:05:15.766976', '2024-02-21 19:05:15.766976', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f47d05c365ea5e6251', 'SANDEEP VISHWASS', '6360446483', 0, '', '2024-02-22 11:00:57.821402', '2024-02-22 11:00:57.821402', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('26cb83cd43515ea1b4', 'TUFAN', NULL, 0, '', '2024-02-22 18:31:45.686635', '2024-02-22 18:31:45.686635', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9d7fe1287c81363768', 'SAMAR BARIK', '9036299207', 0, '', '2024-02-22 19:01:13.165627', '2024-02-22 19:01:13.165627', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a9b3db42a6c6a6ea42', 'BIJEN DAS', '8793462119', 0, '', '2024-02-22 19:09:50.199362', '2024-02-22 19:09:50.199362', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('30a9208a5eb7df5e63', 'AMITH MALIK', NULL, 0, '', '2024-02-23 12:09:40.669751', '2024-02-23 12:09:40.669751', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cf29202374fc57a9b3', 'SUBRAMANI', NULL, 0, '', '2024-02-23 17:06:48.802830', '2024-02-23 17:06:48.802830', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f9a8cf3e90c8bc388b', 'S H', NULL, 0, '', '2024-02-23 19:03:22.355798', '2024-02-23 19:03:22.355798', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1291e9fc592ec34c34', 'AMITH RAJ', NULL, 0, '', '2024-02-23 19:46:56.553550', '2024-02-23 19:46:56.553550', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('63af7bfe065f84749d', 'SHABNATH', NULL, 0, '', '2024-02-23 19:51:20.265589', '2024-02-23 19:51:20.265589', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cbbae24b7125c9935f', 'BALYA DIAMONDS', NULL, 0, '', '2024-02-24 13:37:14.355483', '2024-02-24 13:37:14.355483', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6183e132cd266ecf56', 'MUKTARAM MONDAL', NULL, 0, '', '2024-02-24 16:03:16.127141', '2024-02-24 16:03:16.127141', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0ea30f4ffe8674683f', 'S S A', NULL, 0, '', '2024-02-24 17:06:25.159970', '2024-02-24 17:06:25.159970', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c5737e728fdb2d0fda', 'BIKAS ROI', '9886140065', 0, '', '2024-02-24 20:57:11.202608', '2024-02-24 20:57:11.202608', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ab6ff99adad2bfa3d', 'TOOFAN SHEIKH', '8391011309', 0, '', '2024-02-26 12:14:58.114292', '2024-02-26 12:14:58.114292', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e7d1be78363cacbbd9', 'DEVIR', NULL, 0, '', '2024-02-26 12:24:51.657405', '2024-02-26 12:24:51.657405', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('394ed34ad6b1276463', 'JANAKI', NULL, 0, '', '2024-02-26 14:54:42.613518', '2024-02-26 14:54:42.613518', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('615cabef9eceb72321', 'VARDHAMAN', NULL, 0, '', '2024-02-26 17:43:48.809600', '2024-02-26 17:43:48.809600', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1e300d5ef28cf8f0fa', 'SUBROTHO DAS', NULL, 0, '', '2024-02-26 18:13:46.211236', '2024-02-26 18:13:46.211236', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bfcdff28db8c5b9363', 'AMUL KUMAR MIDEY', NULL, 0, '', '2024-02-26 18:38:14.341103', '2024-02-26 18:38:14.341103', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3956be0017a2208c2a', 'MINTU SAMANTHO', NULL, 0, '', '2024-02-26 19:45:03.849114', '2024-02-26 19:45:03.849114', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('be7325dafc29e20269', 'RIYAZ', NULL, 0, '', '2024-02-26 21:43:15.721492', '2024-02-26 21:43:15.721492', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('98002f2c2f0f67dc65', 'SANATH SAMANTHO', '8073044238', 0, '', '2024-02-27 12:11:55.114187', '2024-02-27 12:11:55.114187', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0fc8c7c46a055c5616', 'BISWAJEET METYA', NULL, 0, '', '2024-02-27 12:32:52.396644', '2024-02-27 12:32:52.396644', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('78af8c213b9ffc0635', 'JALAL', NULL, 0, '', '2024-02-27 12:51:59.040010', '2024-02-27 12:51:59.040010', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d54be61ab9247af9a6', 'ASTIK MONDAL', NULL, 0, '', '2024-02-27 12:59:59.165984', '2024-02-27 12:59:59.165984', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bc7da6fb46da2119b8', 'B J C', NULL, 0, '', '2024-02-27 17:07:19.570097', '2024-02-27 17:07:19.570097', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ed34ee4dbcb6f3310d', 'ACHINTHO', NULL, 0, '', '2024-02-27 17:58:52.172127', '2024-02-27 17:58:52.172127', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fa2806cc9ce4688a2c', 'POLARD', NULL, 0, '', '2024-02-28 11:45:49.797478', '2024-02-28 11:45:49.797478', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a704d3111e48a8482e', 'PRASHANJEET SAWANTHO', NULL, 0, '', '2024-02-28 16:31:29.166219', '2024-02-28 16:31:29.166219', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7679ed044acc49439b', 'SAMIM MD', '9113540396', 0, '', '2024-02-28 16:54:29.127273', '2024-02-28 16:54:29.127273', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('80d199b38c0d816812', 'LAXMI SANTRA', NULL, 0, '', '2024-02-29 11:48:44.700703', '2024-02-29 11:48:44.700703', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('181f65f8593a6f9982', 'UTTAM SHAH', NULL, 0, '', '2024-02-29 11:55:40.290187', '2024-02-29 11:55:40.290187', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6259928972b67e02e4', 'SURRENDRA', NULL, 0, '', '2024-02-29 13:22:02.078311', '2024-02-29 13:22:02.078311', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d698a98e7c58153f75', 'PARSHURAM PATIL', NULL, 0, '', '2024-02-29 14:13:36.004184', '2024-02-29 14:13:36.004184', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('77d7b0c76609cfc034', 'SUDEEP BARMAN', NULL, 0, '', '2024-02-29 18:23:11.249529', '2024-02-29 18:23:11.249529', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a8bc5e703f03fe3192', 'sudharshan jana', NULL, 0, '', '2024-03-01 12:14:00.279969', '2024-03-01 12:14:00.279969', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('29aa79f75b600bd786', 'iqbal mondal', '7899889367', 0, '', '2024-03-01 13:11:50.293989', '2024-03-01 13:11:50.293989', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0df2501ad6bdfab4a7', 'rudra shah', '9164922234', 0, '', '2024-03-01 14:22:57.879542', '2024-03-01 14:22:57.879542', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('483c336bb7ca35f570', 'ranjeet basuli', NULL, 0, '', '2024-03-01 15:29:42.536373', '2024-03-01 15:29:42.536373', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3a9bdbcd9e1371379c', 'sanathan mondal', NULL, 0, '', '2024-03-01 17:14:32.386384', '2024-03-01 17:14:32.386384', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1abc4295d07dd51fe6', 'bappi sheikh', NULL, 0, '', '2024-03-01 17:55:17.708112', '2024-03-01 17:55:17.708112', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('559e4df9fd22acd61c', 'SHAMSUDHIN', NULL, 0, '', '2024-03-02 13:11:26.764333', '2024-03-02 13:11:26.764333', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a8b2966c42e3f5b10f', 'ANJUM', NULL, 0, '', '2024-03-02 18:00:03.720348', '2024-03-02 18:00:03.720348', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('221e9f989c417295ba', 'ratnamchari', NULL, 0, '', '2024-03-02 19:54:49.104206', '2024-03-02 19:54:49.104206', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fe9d2884a4e399de9a', 'jukti', NULL, 0, '', '2024-03-02 21:10:55.569673', '2024-03-02 21:10:55.569673', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('393efc288dec09da05', 'BIPLAB MONDAL', NULL, 0, '', '2024-03-03 14:17:16.127342', '2024-03-03 14:17:16.127342', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c1fbf6c245c532a2d1', 'MOHIN', NULL, 0, '', '2024-03-04 14:42:34.405798', '2024-03-04 14:42:34.405798', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('118bcdd4be31db56ce', 'SUDEEP SARKAR', NULL, 0, '', '2024-03-04 18:35:49.343986', '2024-03-04 18:35:49.343986', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6db0b413541b0d3b88', 'PINTU PAKIRA', NULL, 0, '', '2024-03-04 18:44:33.495185', '2024-03-04 18:44:33.495185', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('79dba4a98eb16c8d52', 'FIROZ', NULL, 0, '', '2024-03-04 20:14:51.044144', '2024-03-04 20:14:51.044144', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7bc521f2b6971f49c6', 'YOGI', NULL, 0, '', '2024-03-05 12:30:59.568046', '2024-03-05 12:30:59.568046', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e9a42ce35f221c076d', 'SOMODEEP', NULL, 0, '', '2024-03-05 15:02:26.257297', '2024-03-05 15:02:26.257297', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2b29d92c38d9479a21', 'B S K J', NULL, 0, '', '2024-03-05 15:41:05.844742', '2024-03-05 15:41:05.844742', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5309494ff9eda5dd4e', 'BISWAJEET DUARI', NULL, 0, '', '2024-03-05 15:41:39.702833', '2024-03-05 15:41:39.702833', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c562591d18bfb7f67d', 'ARJUN DEVNATH', NULL, 0, '', '2024-03-06 11:31:27.793085', '2024-03-06 11:31:27.793085', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('84ff4a503d4fca4619', 'ABHIJEET KARMAKAR', NULL, 0, '', '2024-03-06 15:05:37.711915', '2024-03-06 15:05:37.711915', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3c47d1a2baf9e1911e', 'MILAN DINDA', NULL, 0, '', '2024-03-06 15:16:15.625640', '2024-03-06 15:16:15.625640', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('531ea67ac3fea79af7', 'ARUP KHATUA', NULL, 0, '', '2024-03-07 12:58:09.200129', '2024-03-07 12:58:09.200129', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('47b678972f8bffbb21', 'BABULAL', NULL, 0, '', '2024-03-07 13:05:41.309172', '2024-03-07 13:05:41.309172', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('400b3a41fe7e677b65', 'SUBHOEET MONDAL', '7477513990', 0, '', '2024-03-07 15:57:43.712979', '2024-03-07 15:57:43.712979', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('158990ae6ae394c3ff', 'uttham goriye', NULL, 0, '', '2024-03-08 12:21:43.240024', '2024-03-08 12:21:43.240024', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ba9d7ad822c604641e', 'raghu da', NULL, 0, '', '2024-03-08 12:44:20.798487', '2024-03-08 12:44:20.798487', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('106a5918ffe4a3f549', 'mangal das', NULL, 0, '', '2024-03-08 16:37:56.389321', '2024-03-08 16:37:56.389321', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1eb282b86cce1029c2', 'sameer godiye', NULL, 0, '', '2024-03-08 16:38:36.173721', '2024-03-08 16:38:36.173721', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1ce7c098db5dda8daf', 'thaseen banu', NULL, 0, '', '2024-03-08 16:56:04.379816', '2024-03-08 16:56:04.379816', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a86ecb40879a6d5b42', 'ASHOK MONDAL', NULL, 0, '', '2024-03-09 12:04:34.734205', '2024-03-09 12:04:34.734205', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ec9ca322e9799a6d11', 'UJJAL BHAG', '8095712711', 0, '', '2024-03-09 15:31:02.706038', '2024-03-09 15:31:02.706038', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d1c26557079a4b97d6', 'PRAGYA_4100023133JW/AMJ/2652', NULL, 0, '', '2024-03-09 18:50:55.534605', '2024-03-09 18:50:55.534605', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7d20ff03dd44ffd966', 'PRAGYA-4100023133JW/AMJ/26249', NULL, 0, '', '2024-03-09 18:53:27.977614', '2024-03-09 18:53:27.977614', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('03cda1c91fcfa5ec08', 'PRAGYA-4100023133JW/AMJ/26256', NULL, 0, '', '2024-03-09 18:55:08.393957', '2024-03-09 18:55:08.393957', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a279b16365249aebdf', 'PRAGYA-4100023133JW/AMJ/26251', NULL, 0, '', '2024-03-09 18:56:56.913866', '2024-03-09 18:56:56.913866', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d8406645ef9f6d2f5d', 'PRAGYA-4100023133JW/AMJ/26255', NULL, 0, '', '2024-03-09 18:59:15.455693', '2024-03-09 18:59:15.455693', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c22cb0d029df0e96eb', 'PRAGYA-4100023133JW/AMJ/26253', NULL, 0, '', '2024-03-09 19:01:45.342976', '2024-03-09 19:01:45.342976', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d581c28b2ce5d89fc8', 'PRAGYA-4100023133 JW/AMJ/26254', NULL, 0, '', '2024-03-09 19:02:49.010040', '2024-03-09 19:02:49.010040', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('684b72005e6635b633', 'KALI BHAI', NULL, 0, '', '2024-03-09 21:11:09.574323', '2024-03-09 21:11:09.574323', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a8fceb10848e231fd8', 'PRAGYA-4100023133 JW/AMJ/26256', NULL, 0, '', '2024-03-11 12:06:28.492776', '2024-03-11 12:06:28.492776', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('24b3d51011c774a3f8', 'PRAGYA-4100023133 JW/AMJ/26252', NULL, 0, '', '2024-03-11 12:18:21.927404', '2024-03-11 12:18:21.927404', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2870999d512425b9b4', 'PRAGYA-4100023133 JW/AMJ/26248', NULL, 0, '', '2024-03-11 12:20:00.243797', '2024-03-11 12:20:00.243797', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ff40e40a4e248bf6db', 'DEBAPRATHO', NULL, 0, '', '2024-03-11 18:45:43.630176', '2024-03-11 18:45:43.630176', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f32e80c241c99e6b44', 'PRANAB MALIK', '8073170449', 0, '', '2024-03-12 10:37:45.994656', '2024-03-12 10:37:45.994656', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0956112e5794c7a8bd', 'SUPAL DAS', NULL, 0, '', '2024-03-12 13:36:29.008105', '2024-03-12 13:36:29.008105', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f6e26b044614effea7', 'MISRI', NULL, 0, '', '2024-03-12 19:23:49.630907', '2024-03-12 19:23:49.630907', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6e8bd4d74955a0d11a', 'POLASH KOLE', NULL, 0, '', '2024-03-12 19:51:06.808515', '2024-03-12 19:51:06.808515', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('425c4aeaa700652289', 'DEEPAK PRAMANIK', '7676077779', 0, '', '2024-03-13 11:42:51.896024', '2024-03-13 11:42:51.896024', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('da01d9215df60cee9f', 'SAMAR DOLIYE', NULL, 0, '', '2024-03-13 12:03:38.858552', '2024-03-13 12:03:38.858552', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('decdd4962b40254573', 'MUKTHO RAM', '6360726489', 0, '', '2024-03-13 13:10:40.927745', '2024-03-13 13:10:40.927745', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f339718f74cc814a4e', 'DEBIR', NULL, 0, '', '2024-03-13 13:21:02.832640', '2024-03-13 13:21:02.832640', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3c157a876295280ec2', 'PRAGYA_4100023133JW/AMJ/26254', NULL, 0, '', '2024-03-13 13:27:57.835819', '2024-03-13 13:27:57.835819', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ad2993d4ebcddb1d97', 'SAKHIB', NULL, 0, '', '2024-03-13 15:35:35.839546', '2024-03-13 15:35:35.839546', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a5ef7723f9a33834c4', 'MAUSIN', NULL, 0, '', '2024-03-13 16:10:57.232888', '2024-03-13 16:10:57.232888', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c66b32864984e526f4', 'ROOPA M N', NULL, 0, '', '2024-03-13 16:46:26.425242', '2024-03-13 16:46:26.425242', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('070db99968cd65778b', 'ANUP BHAG', NULL, 0, '', '2024-03-13 18:19:00.347529', '2024-03-13 18:19:00.347529', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a2341717b5fe97e413', 'POLTU PAKIRA', '9123365973', 0, '', '2024-03-13 21:44:05.403984', '2024-03-13 21:44:05.403984', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c6b2f5a6a872a09a33', 'NASIM ALI', '9663100685', 0, '', '2024-03-14 11:54:31.398976', '2024-03-14 11:54:31.398976', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('17d830331495428f69', 'BILAP', NULL, 0, '', '2024-03-14 12:12:14.973536', '2024-03-14 12:12:14.973536', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6c11f4b216f81879d3', 'SHARMA', NULL, 0, '', '2024-03-14 12:23:30.170652', '2024-03-14 12:23:30.170652', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1e1bc6e730f4696001', 'DEEP JANA', NULL, 0, '', '2024-03-14 12:40:00.493443', '2024-03-14 12:40:00.493443', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0cfc860d935199e7db', 'SHEIKH SHAMSHUDIN', NULL, 0, '', '2024-03-14 13:52:44.984805', '2024-03-14 13:52:44.984805', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('af783b8d57554b1679', 'PINKY', NULL, 0, '', '2024-03-14 14:10:42.635433', '2024-03-14 14:10:42.635433', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7cb0710c9d33399bb6', 'S K YAKUB', NULL, 0, '', '2024-03-14 17:00:09.648109', '2024-03-14 17:00:09.648109', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('32b4aa8c3bbd629b5a', 'SANJEEV', NULL, 0, '', '2024-03-14 18:50:22.454840', '2024-03-14 18:50:22.454840', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b69935435501f47812', 'MANI DEEP', NULL, 0, '', '2024-03-14 19:44:08.361950', '2024-03-14 19:44:08.361950', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5b0982d13f9e8fb6cc', 'shrishti  jewels', '8779920945', 0, '', '2024-03-15 09:40:03.947583', '2024-03-15 09:40:03.947583', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a45b426440e624424', 'ANSHU', NULL, 0, '', '2024-03-15 13:23:35.548823', '2024-03-15 13:23:35.548823', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('562914549269073f02', 'SUMIT SAWANTHO', NULL, 0, '', '2024-03-15 17:17:25.206414', '2024-03-15 17:17:25.206414', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('391d1159d24ec1e7d8', 'BISWAJEET SAWANTHO', '6289234369', 0, '', '2024-03-16 10:15:34.375467', '2024-03-16 10:15:34.375467', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6504a8f1b9e0e0e00e', 'MAIDUL', NULL, 0, '', '2024-03-16 13:39:17.762637', '2024-03-16 13:39:17.762637', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('464a962ddf646d5db2', 'SUNAI', NULL, 0, '', '2024-03-16 13:43:48.430880', '2024-03-16 13:43:48.430880', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2a8fa4a157b9d34685', 'rajeev da', NULL, 0, '', '2024-03-16 16:50:25.977737', '2024-03-16 16:50:25.977737', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c07eb7acdb0d54888', 'BUMBA DAS', '6296608727', 0, '', '2024-03-17 12:45:10.986823', '2024-03-17 12:45:10.986823', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ed72150178b73f826', 'PRAKASH MONDAL', NULL, 0, '', '2024-03-17 12:59:59.591281', '2024-03-17 12:59:59.591281', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a4430ae044cc4ec529', 'PREETAM KHAITI', '6361550962', 0, '', '2024-03-17 13:12:59.467700', '2024-03-17 13:12:59.467700', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5a5d3031e2afa97492', 'RAJEEV JANA', '7407837036', 0, '', '2024-03-17 14:07:02.808186', '2024-03-17 14:07:02.808186', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b4aea0bfa1da100ab2', 'SANJIB BERA', '7026102991', 0, '', '2024-03-18 14:14:28.498280', '2024-03-18 14:14:28.498280', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('751cb1e3d2677ee561', 'NITHAI SAWANTHO', NULL, 0, '', '2024-03-18 15:21:17.865417', '2024-03-18 15:21:17.865417', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9c11cdf0eddd97fd84', 'S S', NULL, 0, '', '2024-03-18 20:20:15.989055', '2024-03-18 20:20:15.989055', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('960092016acfc375bd', 'S D M', NULL, 0, '', '2024-03-19 18:44:06.707886', '2024-03-19 18:44:06.707886', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('673b304ba831ef34c6', 'K V P', NULL, 0, '', '2024-03-20 14:32:01.777527', '2024-03-20 14:32:01.777527', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('15c4c17089217cecd4', 'GAGAN', NULL, 0, '', '2024-03-20 16:05:19.317759', '2024-03-20 16:05:19.317759', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ec07080a943c6dd3b5', 'K K SABHARWAL', NULL, 0, '', '2024-03-21 12:08:36.205924', '2024-03-21 12:08:36.205924', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f4ebb2c8a3e229a746', 'DILIP SING', NULL, 0, '', '2024-03-21 17:44:06.924284', '2024-03-21 17:44:06.924284', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('06fc1cba45249b2d63', 'BARUN SAWANTHO', '9110833393', 0, '', '2024-03-21 21:00:24.987250', '2024-03-21 21:00:24.987250', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3a1c6a964c6698be1f', 'SUJAY CHANDRA', '9342473573', 0, '', '2024-03-22 10:28:55.929627', '2024-03-22 10:28:55.929627', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('99272bfa560b44b010', 'PRASANJEET SAMANTHO', '7411266473', 0, '', '2024-03-23 13:07:28.327871', '2024-03-23 13:07:28.327871', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f719b680121a6702dc', 'N B K', NULL, 0, '', '2024-03-23 14:31:05.885300', '2024-03-23 14:31:05.885300', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('62973e12f988dc9433', 'padam', NULL, 0, '', '2024-03-23 16:50:10.946340', '2024-03-23 16:50:10.946340', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('773a98a7064a3b7317', 'manas bera', NULL, 0, '', '2024-03-24 14:20:37.840197', '2024-03-24 14:20:37.840197', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('57bd4b677fc8cb03de', 'NITHAYE DIGAR', '7022615090', 0, '', '2024-03-25 14:10:00.013968', '2024-03-25 14:10:00.013968', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1447a3927a6354a3cd', 'NAGORE', NULL, 0, '', '2024-03-26 11:05:22.718575', '2024-03-26 11:05:22.718575', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('244263faab0a1a36bc', 'DEV VEER', NULL, 0, '', '2024-03-26 11:50:48.068978', '2024-03-26 11:50:48.068978', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('45fb043f41edb0434b', 'GANESH GORAI', '7679042394', 0, '', '2024-03-26 13:08:29.598546', '2024-03-26 13:08:29.598546', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1957c9c304e30ad729', 'tapan hajra', NULL, 0, '', '2024-03-26 14:03:21.834693', '2024-03-26 14:03:21.834693', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c9c6314c2bd76c681d', 'pintu pore', '9113984614', 0, '', '2024-03-26 21:24:45.786344', '2024-03-26 21:24:45.786344', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a93a21d92dbdd0d13e', 'nithayanand das', NULL, 0, '', '2024-03-27 16:37:13.676687', '2024-03-27 16:37:13.676687', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('0a85106bcb2294a38d', 'puldendu', NULL, 0, '', '2024-03-27 17:24:52.389859', '2024-03-27 17:24:52.389859', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('b4c98edaa2d035eab8', 'eshwar', NULL, 0, '', '2024-03-27 19:10:57.339298', '2024-03-27 19:10:57.339298', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ea686ea226471ba94c', 'aziz', NULL, 0, '', '2024-03-27 19:32:39.602536', '2024-03-27 19:32:39.602536', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('042a618e06c9c5215c', 'sudeep panja', '8559007718', 0, '', '2024-03-27 20:23:36.116873', '2024-03-27 20:23:36.116873', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e776232c013665ce94', 'N J J', NULL, 30, '', '2024-03-28 12:52:38.554354', '2024-03-28 12:52:38.554354', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1891c913517658f729', 'BSP', NULL, 0, '', '2024-03-28 14:06:26.314108', '2024-03-28 14:06:26.314108', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a9a2e33dbc9b533813', 'PREETAM', NULL, 0, '', '2024-03-28 14:59:37.784724', '2024-03-28 14:59:37.784724', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('acfc3c008c358d71ca', 'RAJJAK SK', '7619608632', 0, '', '2024-03-28 15:23:19.658272', '2024-03-28 15:23:19.658272', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('904c0d4835f0b9a949', 'PSS GOLS', '9591856144', 0, '', '2024-03-28 17:42:55.254028', '2024-03-28 17:42:55.254028', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5717c94d13813ff015', 'S MODI', '9686316167', 0, '', '2024-03-28 18:24:51.883633', '2024-03-28 18:24:51.883633', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('73f9189d613b7b1043', 'SAINIK BHAI', NULL, 0, '', '2024-03-28 18:37:03.928409', '2024-03-28 18:37:03.928409', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('394ff88e4ce33b826e', 'ARUP KATWA', '9206600621', 0, '', '2024-03-28 18:43:10.981695', '2024-03-28 18:43:10.981695', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f515f48f80b898f8bc', 'BAPPAN PANDIT', '9087613528', 0, '', '2024-03-28 19:49:48.344405', '2024-03-28 19:49:48.344405', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('812e6f2e89ab6c4f60', 'P SHAH', NULL, 0, '', '2024-03-28 19:58:15.135978', '2024-03-28 19:58:15.135978', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d4d8367fa2fae2fc0b', 'AJMAT SHEIKH', NULL, 0, '', '2024-03-28 20:41:10.224882', '2024-03-28 20:41:10.224882', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a9f6d52e6f4f4ebe59', 'DEBASHISH MANNA', '9036868214', 0, '', '2024-03-28 21:23:01.636799', '2024-03-28 21:23:01.636799', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c1f96353e23a971a6a', 'PRINCE', NULL, 0, '', '2024-03-29 12:20:51.277229', '2024-03-29 12:20:51.277229', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('aba1679425fb67fdb6', 'HABIB  PASHA', NULL, 0, '', '2024-03-29 15:17:01.451728', '2024-03-29 15:17:01.451728', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dd63988fda1c9e4351', 'MADHU HAJRA', '8660943037', 0, '', '2024-03-29 15:52:03.085405', '2024-03-29 15:52:03.085405', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ba91b43751e1db68e5', 'KRISHNA  PRASAD', NULL, 0, '', '2024-03-29 17:11:22.138933', '2024-03-29 17:11:22.138933', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('34a1e4813b0246b29f', 'BIKAS BISHWAS', '8536822705', 0, '', '2024-03-30 10:57:27.207904', '2024-03-30 10:57:27.207904', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('76bf62e3ef586e5c0a', 'SK ROBI ALI', NULL, 0, '', '2024-03-30 17:57:46.507812', '2024-03-30 17:57:46.507812', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ecae33498fb08458c', 'SONUP', NULL, 0, '', '2024-03-30 18:36:46.053237', '2024-03-30 18:36:46.053237', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('deb66cd873f5b7ee95', 'SURJEET PATRA', '9108012528', 0, '', '2024-03-30 19:01:21.335699', '2024-03-30 19:01:21.335699', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('87d9d1dd60a21f3524', 'SUDEEP MONDAL', '8327585305', 0, '', '2024-03-30 19:46:52.298915', '2024-03-30 19:46:52.298915', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bfb58a56601f06d961', 'AMIT DAS', '8431342207', 0, '', '2024-03-30 20:48:52.751021', '2024-03-30 20:48:52.751021', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d924b3957814f8a495', 'BIMAL GUCHHAIT', '7483854390', 0, '', '2024-03-30 20:54:33.857135', '2024-03-30 20:54:33.857135', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9a4373a1214742d4f7', 'SOW VEELA', NULL, 0, '', '2024-03-30 21:18:12.548995', '2024-03-30 21:18:12.548995', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('46648ae281a7ebc6a3', 'ASIM BOMIK', '9606439419', 0, '', '2024-03-30 21:31:29.370190', '2024-03-30 21:31:29.370190', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('12dacf749570b2ad16', 'c t r', NULL, 0, '', '2024-03-31 10:08:54.063871', '2024-03-31 10:08:54.063871', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('00a36daec90685e1df', 'tarun kumar pal', '8960043327', 0, '', '2024-03-31 10:37:37.409905', '2024-03-31 10:37:37.409905', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('802a7a076b72d0dc61', 'RAJU ROY', '9620938750', 0, '', '2024-03-31 13:14:49.952810', '2024-03-31 13:14:49.952810', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5eb0f06cd9e8ddbb11', 'SHEIKH SOBAR ALI', NULL, 0, '', '2024-03-31 13:46:32.467936', '2024-03-31 13:46:32.467936', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5bec9e7f4c407ca540', 'ARJUNNA', NULL, 0, '', '2024-03-31 13:57:21.932974', '2024-03-31 13:57:21.932974', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5a9dd809c765c68a2e', 'SANJAY SAWANTH', '7076931320', 0, '', '2024-03-31 14:03:23.915313', '2024-03-31 14:03:23.915313', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5b9331a01e1b1fa657', 'ALI CHAUDHRY', '9380146192', 0, '', '2024-04-01 13:13:49.646158', '2024-04-01 13:13:49.646158', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('1bbc87b398b471fc06', 'KESHAV DAS', '9883149442', 0, '', '2024-04-01 15:11:28.761430', '2024-04-01 15:11:28.761430', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('9bafe9df5f2a3bc527', 'PRASANJEET KOUR', '9972181217', 0, '', '2024-04-01 15:12:57.312647', '2024-04-01 15:12:57.312647', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('fdd6839ca081aa7baf', 'M K', NULL, 0, '', '2024-04-01 15:46:06.435086', '2024-04-01 15:46:06.435086', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a954b7a3b597027513', 'MOHAMMED  SHAKIR', NULL, 0, '', '2024-04-01 16:25:26.528972', '2024-04-01 16:25:26.528972', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('804a87be25737dbff3', 'MINTU MONDAL', '9513862792', 0, '', '2024-04-01 16:42:24.046625', '2024-04-01 16:42:24.046625', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cf9c0a3fb907ca0daa', 'MANI VK', NULL, 0, '', '2024-04-01 17:09:48.547855', '2024-04-01 17:09:48.547855', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4fb8a2bc17889dc017', 'DK 1', NULL, 0, '', '2024-04-01 18:18:18.728443', '2024-04-01 18:18:18.728443', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('7c54367dc28a7bd5df', 'JAY MURALI SONI', NULL, 0, '', '2024-04-01 19:30:31.050248', '2024-04-01 19:30:31.050248', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e0f8c0908768d58f35', 'UTTHAM MALLO', '9800599387', 0, '', '2024-04-01 19:32:04.648082', '2024-04-01 19:32:04.648082', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c522bdd2b73057898e', 'santosh sadra', '7829927997', 0, '', '2024-04-01 19:59:58.665532', '2024-04-01 19:59:58.665532', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2165490c9ea36ae30b', 'sk ripan', '6361512957', 0, '', '2024-04-01 20:28:23.871343', '2024-04-01 20:28:23.871343', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f2bfde4f7be2bfd5ea', 'SIDHU KOTAL', NULL, 0, '', '2024-04-02 11:35:32.085006', '2024-04-02 11:35:32.085006', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('54bf85a3f130a97bd5', 'AMIT  SANTRA', '7047227752', 0, '', '2024-04-02 12:48:17.011032', '2024-04-02 12:48:17.011032', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a7760f3e1f29aa91e6', 'ASIT SANTRA', '9900501787', 0, '', '2024-04-02 13:20:57.743057', '2024-04-02 13:20:57.743057', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('cde3547bfad8cafa2d', 'MUNIR ALAM', NULL, 0, '', '2024-04-02 14:01:40.337745', '2024-04-02 14:01:40.337745', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2de952d829ffc2a36c', 'RAJA  H  (KRISHNA)', NULL, 0, '', '2024-04-02 19:23:44.542913', '2024-04-02 19:23:44.542913', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f6b8b43f967617fa04', 'STYANATH', NULL, 0, '', '2024-04-04 11:41:46.333621', '2024-04-04 11:41:46.333621', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('339a44cdf6793783b4', 'K K', NULL, 0, '', '2024-04-04 11:53:40.222133', '2024-04-04 11:53:40.222133', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d86145db2dfcce9319', 'SATYNATH MONDAL', NULL, 0, '', '2024-04-04 13:13:23.504170', '2024-04-04 13:13:23.504170', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('2a38bc39b4e03f5fbc', 'SHIKH MANSOOR', NULL, 0, '', '2024-04-04 14:26:32.443747', '2024-04-04 14:26:32.443747', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('48a0ab2a8b775292ea', 'MEHTA', NULL, 0, '', '2024-04-05 12:51:58.658229', '2024-04-05 12:51:58.658229', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('d3bf330e3f943a148d', 'RANJITH BISWAS', NULL, 0, '', '2024-04-05 13:57:36.223114', '2024-04-05 13:57:36.223114', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4c3abe02ec362bd6a7', 'T S  V', NULL, 0, '', '2024-04-05 19:08:53.012387', '2024-04-05 19:08:53.012387', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3506709899e3ea7da5', 'DINESH DAS', '8509571825', 0, '', '2024-04-05 20:05:41.544633', '2024-04-05 20:05:41.544633', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4062f4e948c14fd320', 'RANJITH BASULI', '6295672894', 0, '', '2024-04-05 21:03:34.497444', '2024-04-05 21:03:34.497444', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4074faf72955e0e796', 'PRALAB', NULL, 0, '', '2024-04-06 13:08:32.705949', '2024-04-06 13:08:32.705949', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('5ec345d20644b524ef', 'NJ GOLD WORKERS', NULL, 0, '', '2024-04-06 15:14:20.623390', '2024-04-06 15:14:20.623390', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f072740ebf9ccb9833', 'PASHA BHAI', NULL, 0, '', '2024-04-06 15:40:07.041018', '2024-04-06 15:40:07.041018', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a589152a38489d2e25', 'KRISHNA KUMAR', NULL, 0, '', '2024-04-06 21:37:52.002886', '2024-04-06 21:37:52.002886', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('909cc64b1f07b94621', 'PROBHAT', NULL, 0, '', '2024-04-07 11:48:41.578054', '2024-04-07 11:48:41.578054', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('40aedfba7f5a5ef599', 'MAHA MAJI', NULL, 0, '', '2024-04-07 12:09:03.339164', '2024-04-07 12:09:03.339164', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3cff2a83699b2636ae', 'ELIZA', NULL, 0, '', '2024-04-07 13:09:20.492665', '2024-04-07 13:09:20.492665', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c7bc4ea35f5c83c0d1', 'PABEL', NULL, 0, '', '2024-04-07 13:47:20.334314', '2024-04-07 13:47:20.334314', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('ee42673604cd15ed80', 'SAMANAND', NULL, 0, '', '2024-04-07 14:21:50.291139', '2024-04-07 14:21:50.291139', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('6496bf30536836204d', 'B G I', NULL, 0, '', '2024-04-08 11:57:35.043724', '2024-04-08 11:57:35.043724', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('4023438679c5e35e22', 'SUMAN PATRA', NULL, 0, '', '2024-04-08 15:10:00.399489', '2024-04-08 15:10:00.399489', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('02f4ee29a82d4164f5', 'AJAY ADAK', '8502008194', 0, '', '2024-04-08 20:12:36.871596', '2024-04-08 20:12:36.871596', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('80a9cb93b2f6d687b7', 'SANU', NULL, 0, '', '2024-04-08 20:49:07.194118', '2024-04-08 20:49:07.194118', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('53824b2adf7130e15a', 'MUSTAK', NULL, 0, '', '2024-04-09 11:19:00.180780', '2024-04-09 11:19:00.180780', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f8c7ecd54060cca2d3', 'BIMAL GORIYA', '9619347046', 0, '', '2024-04-09 12:47:32.690014', '2024-04-09 12:47:32.690014', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('e6481b3e40bb901dfb', 'A N J', NULL, 0, '', '2024-04-09 13:20:30.850745', '2024-04-09 13:20:30.850745', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('26c4e478ac9f19f92d', 'NIKUJ BHAI', NULL, 0, '', '2024-04-09 19:34:10.141711', '2024-04-09 19:34:10.141711', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('eff546252f8c55f830', 'NILMONI', NULL, 0, '', '2024-04-09 21:22:52.867330', '2024-04-09 21:22:52.867330', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('bdedd3ab63616ee094', 'BALAK', NULL, 0, '', '2024-04-10 11:43:29.569163', '2024-04-10 11:43:29.569163', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c40d878da39f570f10', 'IJJAZ', NULL, 0, '', '2024-04-10 14:25:01.351430', '2024-04-10 14:25:01.351430', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('886b2482216bd29945', 'NITHESH', NULL, 0, '', '2024-04-10 15:24:10.479370', '2024-04-10 15:24:10.479370', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('10b12377d5d239d6b3', 'NITESH', NULL, 0, '', '2024-04-10 16:33:04.694572', '2024-04-10 16:33:04.694572', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('513001e62997b9357b', 'P K JEWELS', NULL, 0, '', '2024-04-11 14:01:05.997878', '2024-04-11 14:01:05.997878', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('295b270d4b22c03a67', 'S K', NULL, 0, '', '2024-04-11 14:02:33.458711', '2024-04-11 14:02:33.458711', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('37653c31281467050d', 'KUNAL', NULL, 0, '', '2024-04-11 15:14:50.720831', '2024-04-11 15:14:50.720831', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('65d1a9ef82b45cfb81', 'BHERUNATH JEWEL', NULL, 0, '', '2024-04-11 19:58:43.663058', '2024-04-11 19:58:43.663058', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('f995d944b4694cb1d4', 'PINTU SUBU', NULL, 0, '', '2024-04-12 14:14:03.562150', '2024-04-12 14:14:03.562150', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('177ecb17ba00faa928', 'ABHAUYA GUPTA', NULL, 0, '', '2024-04-12 17:39:20.045155', '2024-04-12 17:39:20.045155', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('3fdd6fdd34a00487f0', 'SONAYE', NULL, 0, '', '2024-04-12 19:53:12.581973', '2024-04-12 19:53:12.581973', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('c358d2ff844b242d8d', 'NITISH', NULL, 0, '', '2024-04-13 14:56:02.927339', '2024-04-13 14:56:02.927339', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('a95cd8f8908f3b398f', 'BASHA', NULL, 0, '', '2024-04-13 16:37:21.445501', '2024-04-13 16:37:21.445501', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('dd36927b1510383d7f', 'SEJAL CHAINS', NULL, 0, '', '2024-04-13 16:44:34.898007', '2024-04-13 16:44:34.898007', 'retail', 'pending');
INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) 
VALUES ('99a81d237fd967a670', 'P S', NULL, 0, '', '2024-04-13 17:31:09.679367', '2024-04-13 17:31:09.679367', 'retail', 'pending');

PRAGMA foreign_keys = ON;
