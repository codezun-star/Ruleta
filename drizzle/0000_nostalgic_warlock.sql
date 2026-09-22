CREATE TYPE "public"."draw_mode" AS ENUM('raffle', 'secretSanta');--> statement-breakpoint
CREATE TYPE "public"."email_kind" AS ENUM('secretSanta', 'raffleWinner', 'raffleParticipant', 'organizerReceipt');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"draw_id" uuid NOT NULL,
	"giver_id" uuid NOT NULL,
	"nonce" text NOT NULL,
	"ciphertext" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "draws" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mode" "draw_mode" NOT NULL,
	"locale" text NOT NULL,
	"seed" text NOT NULL,
	"fingerprint" text NOT NULL,
	"short_id" text NOT NULL,
	"prize" text,
	"winner_count" integer,
	"notify" text,
	"budget" numeric,
	"currency" text,
	"exchange_date" date,
	"place" text,
	"message" text,
	"organizer_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"purge_after" timestamp with time zone NOT NULL,
	"purged_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"draw_id" uuid NOT NULL,
	"participant_id" uuid,
	"kind" "email_kind" NOT NULL,
	"to_email" text NOT NULL,
	"status" "email_status" DEFAULT 'pending' NOT NULL,
	"provider_id" text,
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"draw_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"token" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raffle_winners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"draw_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_draw_id_draws_id_fk" FOREIGN KEY ("draw_id") REFERENCES "public"."draws"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_giver_id_participants_id_fk" FOREIGN KEY ("giver_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_draw_id_draws_id_fk" FOREIGN KEY ("draw_id") REFERENCES "public"."draws"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_draw_id_draws_id_fk" FOREIGN KEY ("draw_id") REFERENCES "public"."draws"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffle_winners" ADD CONSTRAINT "raffle_winners_draw_id_draws_id_fk" FOREIGN KEY ("draw_id") REFERENCES "public"."draws"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffle_winners" ADD CONSTRAINT "raffle_winners_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assignments_draw_idx" ON "assignments" USING btree ("draw_id");--> statement-breakpoint
CREATE UNIQUE INDEX "draws_short_id_idx" ON "draws" USING btree ("short_id");--> statement-breakpoint
CREATE INDEX "draws_purge_after_idx" ON "draws" USING btree ("purge_after");--> statement-breakpoint
CREATE INDEX "email_deliveries_draw_idx" ON "email_deliveries" USING btree ("draw_id");--> statement-breakpoint
CREATE INDEX "participants_draw_idx" ON "participants" USING btree ("draw_id");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_token_idx" ON "participants" USING btree ("token");--> statement-breakpoint
CREATE INDEX "raffle_winners_draw_idx" ON "raffle_winners" USING btree ("draw_id");