CREATE TABLE `reflections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`summary` text NOT NULL,
	`evidence` text NOT NULL,
	`confidence` integer NOT NULL,
	`created_at` text NOT NULL
);
