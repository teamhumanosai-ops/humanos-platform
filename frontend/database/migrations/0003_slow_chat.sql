CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`goal` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`milestones` text NOT NULL,
	`completed_milestones` text NOT NULL,
	`next_action` text NOT NULL,
	`priority` integer NOT NULL,
	`confidence` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `memories` ADD `kind` text DEFAULT 'short_term' NOT NULL;--> statement-breakpoint
ALTER TABLE `memories` ADD `importance` integer DEFAULT 0 NOT NULL;