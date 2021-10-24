drop table if exists highScores;
drop table if exists users;
drop table if exists OAuthHighScores;
drop table if exists OAuthUsers;

create table users (
userID			integer					NOT NULL auto_increment,
username		varchar(20)				NOT NULL,
password		varchar(100)			NOT NULL,
primary key (userID)
);

create table OAuthUsers (
userID			integer					NOT NULL auto_increment,
username		varchar(20)				NOT NULL,
provider		varchar(20)				NOT NULL,
primary key (userID)
);

create table highScores (
userID			integer					NOT NULL,
seconds			varchar(20)				NOT NULL,
minutes			varchar(20)				NOT NULL,
hours			varchar(20)				NOT NULL,
primary key (userID),
foreign key (userID) references users(userID)
);

create table OAuthHighScores (
userID			integer					NOT NULL,
seconds			varchar(20)				NOT NULL,
minutes			varchar(20)				NOT NULL,
hours			varchar(20)				NOT NULL,
primary key (userID),
foreign key (userID) references OAuthUsers(userID)
);

select * from users;
select * from OAuthUsers;
select * from highScores;
select * from OAuthHighScores;