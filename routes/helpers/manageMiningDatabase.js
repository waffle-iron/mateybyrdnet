/**
 * Created by nickbelzer on 23/12/2016.
 */

/* CREATE DATABASE
 CREATE TABLE mining_game.sessions
 (
 session_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
 last_active DATETIME NOT NULL,
 workers INT DEFAULT 1 NOT NULL
 );
 CREATE UNIQUE INDEX sessions_session_id_uindex ON mining_game.sessions
 (session_id);

 CREATE TABLE mining_game.transactions
 (
 transaction_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
 session_id INT NOT NULL,
 amount INT NOT NULL,
 CONSTRAINT session FOREIGN KEY (session_id) REFERENCES mining_game.sessions
 (session_id) ON UPDATE CASCADE ON DELETE CASCADE
 );

 CREATE UNIQUE INDEX transactions_transaction_id_uindex ON mining_game.transactions (transaction_id);
 */