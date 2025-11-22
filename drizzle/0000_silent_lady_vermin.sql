CREATE TABLE "attractions" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"timing" varchar(50) NOT NULL,
	"rating" double precision NOT NULL,
	"reviews" integer NOT NULL,
	"category" varchar(100) NOT NULL,
	"day" integer NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indoor_places" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"rating" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nearby_places" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"rating" double precision NOT NULL,
	"reviews" integer NOT NULL,
	"price_level" varchar(50) NOT NULL,
	"distance" varchar(50) NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"rating" double precision NOT NULL,
	"reviews" integer NOT NULL,
	"price" integer NOT NULL,
	"cuisine" varchar(100) NOT NULL,
	"day" integer NOT NULL,
	"meal_type" varchar(50) NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"destination" varchar(255) NOT NULL,
	"days" integer NOT NULL,
	"budget" integer NOT NULL,
	"travel_style" varchar(50) NOT NULL,
	"interests" text[] NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "underrated_places" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"status" varchar(50) NOT NULL,
	"exif_distance" double precision,
	"reverse_image_found" boolean,
	"ai_fake_score" double precision,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "attractions" ADD CONSTRAINT "attractions_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indoor_places" ADD CONSTRAINT "indoor_places_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nearby_places" ADD CONSTRAINT "nearby_places_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;