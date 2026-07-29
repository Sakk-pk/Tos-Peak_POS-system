<?php

namespace Database\Seeders;

use App\Models\Product\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $items = array (
  0 => 
  array (
    'id' => 72,
    'category_id' => 6,
    'sub_category_id' => 2,
    'color_id' => 6,
    'brand_id' => 1,
    'size_id' => 7,
    'name' => 'Nike Air Max Plus By Nico Williams',
    'description' => 'This tried-and-tested shoe is back in a variety of neutrals for versatile style. Add a bit of shine with metallic mesh on the upper and iridescent options on the plastic cage. After choosing between 7 different tongue labels, finish it off with personal text on each Air unit. The Air Max Plus is ready for your special touch.',
    'price' => '180.00',
    'stock' => 20,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785253817_Nike_Air_Max_Plus_By_Nico_Williams.avif',
    'created_at' => '2026-07-28T15:50:17.000000Z',
    'updated_at' => '2026-07-28T15:50:17.000000Z',
  ),
  1 => 
  array (
    'id' => 73,
    'category_id' => 7,
    'sub_category_id' => 2,
    'color_id' => 4,
    'brand_id' => 1,
    'size_id' => 7,
    'name' => 'Nike P 6000',
    'description' => 'The P-6000 is a mash-up of Pegasus sneakers past. It takes the early 2000s running style to modern heights by combining sporty design lines with breathable textiles. And its foam cushioning adds a lifted, athletics-inspired stance for unbelievable comfort.',
    'price' => '120.00',
    'stock' => 23,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785253943_Nike_P_6000.avif',
    'created_at' => '2026-07-28T15:52:23.000000Z',
    'updated_at' => '2026-07-28T15:54:11.000000Z',
  ),
  2 => 
  array (
    'id' => 74,
    'category_id' => 7,
    'sub_category_id' => 2,
    'color_id' => 4,
    'brand_id' => 1,
    'size_id' => 7,
    'name' => 'Nike P 6000',
    'description' => 'The P-6000 is a mash-up of Pegasus sneakers past. It takes the early 2000s running style to modern heights by combining sporty design lines with breathable textiles. And its foam cushioning adds a lifted, athletics-inspired stance for unbelievable comfort.',
    'price' => '212.00',
    'stock' => 32,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785254025_Nike_P_6000.avif',
    'created_at' => '2026-07-28T15:53:45.000000Z',
    'updated_at' => '2026-07-28T15:54:11.000000Z',
  ),
  3 => 
  array (
    'id' => 75,
    'category_id' => 6,
    'sub_category_id' => 2,
    'color_id' => 4,
    'brand_id' => 1,
    'size_id' => 7,
    'name' => 'Air Jordan 1 Retro High OG \'Love Letter\'',
    'description' => 'When MJ retired from basketball, his final love letter to the game closed with the words, "Much Love and Respect." The new AJ1 High OG \'Love Letter\' holds on to that devotion. The silhouette gets the heritage treatment with a nubuck leather and soft suede design. Together, these materials will develop a patina with each wear—a little nod to his dedication, grit and heart for the hardwood. Finishing touches bring it right back to that iconic sign oﬀ. Peep "Much Love and Respect" on the collar and hang tag for a reminder that true love gets deeper with time.',
    'price' => '220.00',
    'stock' => 17,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785254166_Air_Jordan_1_Retro_High_OG__Love_Letter__.avif',
    'created_at' => '2026-07-28T15:56:06.000000Z',
    'updated_at' => '2026-07-28T15:56:06.000000Z',
  ),
  4 => 
  array (
    'id' => 76,
    'category_id' => 10,
    'sub_category_id' => 1,
    'color_id' => 4,
    'brand_id' => 2,
    'size_id' => 7,
    'name' => 'Sabrina 4',
    'description' => 'Sabrina\'s pace is unpredictable—shifting gears without warning and freezing defenders in their tracks. The Sabrina 4 is built to match her game, updated with the athletics-inspired Nike Flyplate for those sudden bursts of speed. "It feels like you have that pop in your step", Sabrina says. With Cushlon 3.0 foam and a secure midfoot lockdown system, it helps you accelerate and stop in an instant when your best is needed at crunch time.',
    'price' => '150.00',
    'stock' => 35,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785254231_Sabrina_4_.avif',
    'created_at' => '2026-07-28T15:57:11.000000Z',
    'updated_at' => '2026-07-28T15:57:11.000000Z',
  ),
  5 => 
  array (
    'id' => 77,
    'category_id' => 10,
    'sub_category_id' => 1,
    'color_id' => 5,
    'brand_id' => 1,
    'size_id' => 7,
    'name' => 'Nike Mercurial Vapor 17 Academy By You',
    'description' => 'Designed to spark quick sprints and your creativity, the Vapor 17 Academy By You\'s soft NikeSkin upper has you ready for takeoff. It combines with our exclusive lightweight plate to help fuel sharp turns and smooth changes of direction.',
    'price' => '80.00',
    'stock' => 20,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785254369_Nike_Mercurial_Vapor_17_Academy_By_You_.avif',
    'created_at' => '2026-07-28T15:59:29.000000Z',
    'updated_at' => '2026-07-28T15:59:29.000000Z',
  ),
  6 => 
  array (
    'id' => 78,
    'category_id' => 8,
    'sub_category_id' => 2,
    'color_id' => 5,
    'brand_id' => 1,
    'size_id' => 7,
    'name' => 'Nike Air Max 95 Big Bubble',
    'description' => 'The AM95 doesn\'t follow trends—it sets them. First in the Air Max line-up to break from the established AM look, the \'95\'s airy mesh and rippling layers of synthetic leather are meant to mimic the human form. Thirty years later it still retains the same rebellious spirit, innovative tech and game-changing comfort.',
    'price' => '130.00',
    'stock' => 23,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785254448_Nike_Air_Max_95_Big_Bubble_.avif',
    'created_at' => '2026-07-28T16:00:48.000000Z',
    'updated_at' => '2026-07-28T16:00:48.000000Z',
  ),
  7 => 
  array (
    'id' => 79,
    'category_id' => 10,
    'sub_category_id' => 1,
    'color_id' => 6,
    'brand_id' => 2,
    'size_id' => 7,
    'name' => 'Nike Phantom 6 High Academy',
    'description' => 'Level up your accuracy with the Phantom 6 Academy. It powers your precision with a NikeSkin touch zone, located where you need it for clean strikes. The grippy texture helps you take advantage of scoring opportunities by bringing your foot closer to the ball.',
    'price' => '180.00',
    'stock' => 13,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785254551_Nike_Phantom_6_High_Academy_.avif',
    'created_at' => '2026-07-28T16:02:31.000000Z',
    'updated_at' => '2026-07-28T16:02:31.000000Z',
  ),
  8 => 
  array (
    'id' => 80,
    'category_id' => 7,
    'sub_category_id' => 2,
    'color_id' => 5,
    'brand_id' => 1,
    'size_id' => 7,
    'name' => 'Air Jordan 1 Low SE',
    'description' => 'Inspired by the original that debuted in 1985, the Air Jordan 1 Low offers a clean, classic look that\'s familiar yet always fresh. This elegant refresh takes it up a notch with smooth leather in neutral tones and perforated details at the toe.',
    'price' => '145.00',
    'stock' => 13,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785254773_Air_Jordan_1_Low_SE_.avif',
    'created_at' => '2026-07-28T16:06:13.000000Z',
    'updated_at' => '2026-07-28T16:06:13.000000Z',
  ),
  9 => 
  array (
    'id' => 81,
    'category_id' => 8,
    'sub_category_id' => 3,
    'color_id' => 4,
    'brand_id' => 1,
    'size_id' => 7,
    'name' => 'Jordan Future',
    'description' => 'Jordan Future Men\'s Mules - Anthracite/Off-White/Fire Pink

Jordan Future
Men\'s Mules
R 1 599,95
Black/Dark Smoke Grey
Dark Obsidian/Blue Fox/Picante Red
Light Iron Ore/Swan/Legend Medium Brown
Anthracite/Off-White/Fire Pink

Select Size
Size Guide

UK 4.5

UK 5.5

UK 6

UK 7

UK 8

UK 9

UK 10

UK 11

UK 12

UK 13

UK 14

UK 15

UK 16
Add to Bag
Favourite
Slide into comfort with the Jordan Future Mule. It\'s a sleek and comfortable slip-on shoe that\'s solid enough for everyday wear, complete with timeless Jordan ethos.',
    'price' => '95.00',
    'stock' => 12,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785254888_Jordan_Future_.avif',
    'created_at' => '2026-07-28T16:08:08.000000Z',
    'updated_at' => '2026-07-28T16:08:08.000000Z',
  ),
  10 => 
  array (
    'id' => 82,
    'category_id' => 6,
    'sub_category_id' => 2,
    'color_id' => 4,
    'brand_id' => 3,
    'size_id' => 7,
    'name' => 'Charles F',
    'description' => 'We’ve partnered with one of England’s oldest tanneries, Charles F. Stead, to usher in a new era for one of our most beloved and timeless styles: The Suede. For over 130 years, Charles F. Stead Tannery has been constructing premium suede products with the finest craftsmanship. In this new execution, the PUMA Suede gets a deluxe treatment with a full CFS suede upper, leather Formstrip, and custom CFS suede lace tag.',
    'price' => '110.00',
    'stock' => 14,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785255550_Charles_F.png',
    'created_at' => '2026-07-28T16:19:10.000000Z',
    'updated_at' => '2026-07-28T16:19:10.000000Z',
  ),
  11 => 
  array (
    'id' => 83,
    'category_id' => 6,
    'sub_category_id' => 2,
    'color_id' => 4,
    'brand_id' => 3,
    'size_id' => 7,
    'name' => 'Suede Vibram®',
    'description' => 'It’s more than a sneaker – it’s a legend. Since 1968, the PUMA Suede has been an icon of streetwear, sport, and style. These Suede Vibram® sneakers have outstanding grip and flex.',
    'price' => '135.00',
    'stock' => 23,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785255703_Suede_Vibram__.png',
    'created_at' => '2026-07-28T16:21:43.000000Z',
    'updated_at' => '2026-07-28T16:21:43.000000Z',
  ),
  12 => 
  array (
    'id' => 84,
    'category_id' => 8,
    'sub_category_id' => 2,
    'color_id' => 4,
    'brand_id' => 3,
    'size_id' => 7,
    'name' => 'Speedcat OG',
    'description' => 'An icon of racing culture, the PUMA Speedcat has been synonymous with speed, precision, and unparalleled performance for over 25 years. It originated as a fireproof Formula 1® footwear style, but over the decades it found itself on a new circuit – transcending the tracks of Monaco for the streets of global fashion capitals. Wrapped in soft suede and premium leather, this silhouette is reissued in its original red and black colorways with a new PUMA Cat Logo at the front.',
    'price' => '100.00',
    'stock' => 25,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785255861_Speedcat_OG.png',
    'created_at' => '2026-07-28T16:24:21.000000Z',
    'updated_at' => '2026-07-28T16:24:21.000000Z',
  ),
  13 => 
  array (
    'id' => 85,
    'category_id' => 10,
    'sub_category_id' => 1,
    'color_id' => 5,
    'brand_id' => 3,
    'size_id' => 7,
    'name' => 'ForeverRun NITRO™ 3',
    'description' => 'Stability in motion. The ForeverRun NITRO™ 3 brings a new level of support to everyday road running. The full NITRO™ midsole has a dual-density construction – with a cushioned core and firmer rim – to help you find guidance in your stride.',
    'price' => '130.00',
    'stock' => 16,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785255955_ForeverRun_NITRO____3.png',
    'created_at' => '2026-07-28T16:25:55.000000Z',
    'updated_at' => '2026-07-28T16:25:55.000000Z',
  ),
  14 => 
  array (
    'id' => 86,
    'category_id' => 10,
    'sub_category_id' => 1,
    'color_id' => 5,
    'brand_id' => 3,
    'size_id' => 7,
    'name' => 'FAST R NITRO™ Elite 3',
    'description' => 'Fast-R3 is the fastest running shoe we’ve ever made – data-back, lab-tested, and built for breakthroughs. After testing it on elite runners and real athletes, we digitally engineered and optimized the product fully based on data. Fast-R3 is designed to shave minutes off your race time. With its 3.15% improved running economy*, this translates to an unprecedented potential marathon time saving of more than 4 minutes and 30 seconds, for a 3 hour marathon runner. We cut 95g from its predecessor, stacked it higher with new and improved NITROFOAM™ ELITE, and extended the carbon PWRPLATE for maximum propulsion. *Compared to the PUMA Fast-R NITRO™ Elite 2',
    'price' => '135.00',
    'stock' => 13,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785256215_FAST_R_NITRO____Elite_3_.png',
    'created_at' => '2026-07-28T16:30:15.000000Z',
    'updated_at' => '2026-07-28T16:30:15.000000Z',
  ),
  15 => 
  array (
    'id' => 87,
    'category_id' => 8,
    'sub_category_id' => 2,
    'color_id' => 6,
    'brand_id' => 3,
    'size_id' => 7,
    'name' => 'Scuderia Ferrari Speedcat',
    'description' => 'The Speedcat sneakers bring edge and individuality to any outfit. Channel motorsport-inspired design in an icon inspired by the speed of the racetrack. A Ferrari shield on the heel provides a signature finish.',
    'price' => '210.00',
    'stock' => 15,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785256357_Scuderia_Ferrari_Speedcat_.png',
    'created_at' => '2026-07-28T16:32:37.000000Z',
    'updated_at' => '2026-07-28T16:32:37.000000Z',
  ),
  16 => 
  array (
    'id' => 88,
    'category_id' => 8,
    'sub_category_id' => 2,
    'color_id' => 4,
    'brand_id' => 3,
    'size_id' => 7,
    'name' => 'PUMA x HYROX NITROCAT',
    'description' => 'PUMA x HYROX delivers high-performance designs specifically curated for the ultimate fitness race. These slides take that same performance edge into recovery mode with plush NITROFOAM™ cushioning and a thick midsole.',
    'price' => '85.00',
    'stock' => 14,
    'low_stock_threshold' => 5,
    'low_stock_alert_enabled' => true,
    'last_low_stock_alert_at' => NULL,
    'image' => 'products/1785256622_PUMA_x_HYROX_NITROCAT_.png',
    'created_at' => '2026-07-28T16:37:02.000000Z',
    'updated_at' => '2026-07-28T16:37:02.000000Z',
  ),
);

        foreach ($items as $item) {
            Product::updateOrCreate(["id" => $item["id"]], $item);
        }

        Product::whereNotIn('id', array_column($items, 'id'))->delete();
    }
}
