CREATE TABLE `api_keys` (
	`key` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`permissions` text NOT NULL,
	`rate_limit` integer NOT NULL,
	`last_used_at` integer,
	`created_at` integer DEFAULT '"2025-11-12T03:28:30.154Z"' NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `market_data` (
	`id` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`price` real NOT NULL,
	`change_percent` real,
	`volume` integer,
	`timestamp` integer DEFAULT '"2025-11-12T03:28:30.153Z"' NOT NULL,
	`source` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `promo_codes` (
	`code` text PRIMARY KEY NOT NULL,
	`discount_percent` integer NOT NULL,
	`valid_until` integer NOT NULL,
	`max_uses` integer NOT NULL,
	`current_uses` integer DEFAULT 0 NOT NULL,
	`applicable_tiers` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` text PRIMARY KEY NOT NULL,
	`referrer_user_id` text NOT NULL,
	`referred_user_id` text NOT NULL,
	`status` text NOT NULL,
	`reward_given` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT '"2025-11-12T03:28:30.154Z"' NOT NULL,
	FOREIGN KEY (`referrer_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`referred_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `signal_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`symbol` text NOT NULL,
	`signal_type` text NOT NULL,
	`confidence` integer NOT NULL,
	`price_at_signal` real NOT NULL,
	`timestamp` integer DEFAULT '"2025-11-12T03:28:30.153Z"' NOT NULL,
	`outcome` text,
	`price_after_24h` real,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tier` text NOT NULL,
	`status` text NOT NULL,
	`started_at` integer DEFAULT '"2025-11-12T03:28:30.153Z"' NOT NULL,
	`expires_at` integer,
	`auto_renew` integer DEFAULT true NOT NULL,
	`crypto_address` text,
	`crypto_currency` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`order_id` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`payment_method` text NOT NULL,
	`status` text NOT NULL,
	`crypto_transaction_hash` text,
	`crypto_currency` text,
	`created_at` integer DEFAULT '"2025-11-12T03:28:30.153Z"' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_order_id_unique` ON `transactions` (`order_id`);--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`risk_profile` text,
	`experience_level` text,
	`preferred_language` text DEFAULT 'id' NOT NULL,
	`timezone` text DEFAULT 'Asia/Jakarta' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text,
	`phone` text,
	`subscription_tier` text DEFAULT 'free' NOT NULL,
	`created_at` integer DEFAULT '"2025-11-12T03:28:30.152Z"' NOT NULL,
	`last_login` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `watchlists` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`symbol` text NOT NULL,
	`added_at` integer DEFAULT '"2025-11-12T03:28:30.153Z"' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
