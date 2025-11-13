-- #01: Insert the following new record to the account table
INSERT INTO
	PUBLIC."account" (
		"account_firstname",
		"account_lastname",
		"account_email",
		"account_password"
	)
VALUES
	(
		'Tony',
		'Stark',
		'tony@starkent.com',
		'Iam1ronM@n'
	);

-- #02: Modify the Tony Stark record to change the account_type to "Admin".
UPDATE PUBLIC."account"
SET
	"account_type" = 'Admin'
WHERE
	"account_id" = 2;

-- 03: Delete the Tony Stark record from the database.
DELETE FROM PUBLIC."account"
WHERE
	"account_id" = 2;

-- 04: Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors" using a single query
UPDATE PUBLIC."inventory"
SET
	"inv_description" = REPLACE(
		"inv_description",
		'the small interiors',
		'a huge interior'
	)
WHERE
	"inv_id" = 10;

-- 05: Use an inner join to select the make and model fields from the inventory table and
-- the classification name field from the classification table for inventory items
-- that belong to the "Sport" category
SELECT
	I."inv_make",
	I."inv_model",
	C."classification_name"
FROM
	PUBLIC."inventory" AS I
	INNER JOIN PUBLIC."classification" AS C ON I."classification_id" = C."classification_id"
WHERE
	C."classification_id" = 2;

-- 06: Update all records in the inventory table to add "/vehicles" to the middle of the file path
-- in the inv_image and inv_thumbnail columns using a single query
UPDATE PUBLIC."inventory"
SET
	"inv_image" = REPLACE("inv_image", '/images/', '/images/vehicles/'),
	"inv_thumbnail" = REPLACE("inv_thumbnail", '/images/', '/images/vehicles/');