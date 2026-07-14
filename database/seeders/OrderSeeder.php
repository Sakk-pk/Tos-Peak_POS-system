<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $o1 = Order::create([
            'order_number' => 'TP-918273',
            'customer_name' => 'Walk-in Customer',
            'customer_email' => 'walkin@example.com',
            'subtotal' => 39.99,
            'tax' => 3.20,
            'total_amount' => 43.19,
            'payment_method' => 'cash',
            'payment_status' => 'Paid',
            'cash_received' => 50.00,
            'change_amount' => 6.81
        ]);
        $o1->items()->create([
            'product_id' => 1,
            'product_name' => 'Aero Runner',
            'quantity' => 1,
            'price' => 39.99,
            'color' => 'Red',
            'size' => '40',
            'brand' => 'Nike',
            'product_image' => 'products/AOFCGwnDWLDn8Laz515UmY2jxzt2dUDskicnd4Wv.jpg'
        ]);

        $o2 = Order::create([
            'order_number' => 'TP-827364',
            'customer_name' => 'John Doe',
            'customer_email' => 'john.doe@example.com',
            'customer_phone' => '+85512345678',
            'subtotal' => 54.00,
            'tax' => 4.32,
            'total_amount' => 58.32,
            'payment_method' => 'card',
            'payment_status' => 'Paid',
            'cash_received' => 58.32,
            'change_amount' => 0.00
        ]);
        $o2->items()->create([
            'product_id' => 3,
            'product_name' => 'Runer',
            'quantity' => 2,
            'price' => 20.00,
            'color' => 'Black',
            'size' => '41',
            'brand' => 'Adidas',
            'product_image' => 'products/wVOV2yPztbKuFi13nsdEAKUidqg8EdvrH2FFGGlz.jpg'
        ]);

        $o3 = Order::create([
            'order_number' => 'TP-182746',
            'customer_name' => 'Sarah Connor',
            'customer_email' => 'sarah.c@example.com',
            'customer_phone' => '+85598765432',
            'subtotal' => 14.00,
            'tax' => 1.12,
            'total_amount' => 15.12,
            'payment_method' => 'qr',
            'payment_status' => 'Paid',
            'cash_received' => 15.12,
            'change_amount' => 0.00
        ]);
        $o3->items()->create([
            'product_id' => 4,
            'product_name' => 'SAk',
            'quantity' => 1,
            'price' => 14.00,
            'color' => 'White',
            'size' => '39',
            'brand' => 'Puma',
            'product_image' => 'products/1COA6NKmVhXV0QrsG5mvG5UempcZYC2LNKIDAHRw.jpg'
        ]);

        // Screenshot Mock Orders
        Order::create([
            'order_number' => 'TP-SC0001',
            'customer_name' => 'Sarah Chen',
            'customer_email' => 'sarah.chen@example.com',
            'customer_phone' => '+1 415 555 0142',
            'subtotal' => 1700.00,
            'tax' => 140.00,
            'total_amount' => 1840.00,
            'payment_method' => 'card',
            'payment_status' => 'Paid'
        ]);

        Order::create([
            'order_number' => 'TP-ML0001',
            'customer_name' => 'Marcus Lee',
            'customer_email' => 'marcus.lee@example.com',
            'customer_phone' => '+1 415 555 0188',
            'subtotal' => 420.00,
            'tax' => 42.00,
            'total_amount' => 462.00,
            'payment_method' => 'cash',
            'payment_status' => 'Paid'
        ]);

        Order::create([
            'order_number' => 'TP-AK0001',
            'customer_name' => 'Aisha Khan',
            'customer_email' => 'aisha.khan@example.com',
            'customer_phone' => '+44 20 7946 0991',
            'subtotal' => 1200.00,
            'tax' => 90.00,
            'total_amount' => 1290.00,
            'payment_method' => 'qr',
            'payment_status' => 'Paid'
        ]);

        Order::create([
            'order_number' => 'TP-DP0001',
            'customer_name' => 'Daniel Park',
            'customer_email' => 'daniel.park@example.com',
            'customer_phone' => '+82 10 4321 9988',
            'subtotal' => 500.00,
            'tax' => 40.00,
            'total_amount' => 540.00,
            'payment_method' => 'card',
            'payment_status' => 'Paid'
        ]);

        Order::create([
            'order_number' => 'TP-ER0001',
            'customer_name' => 'Elena Rossi',
            'customer_email' => 'elena.rossi@example.com',
            'customer_phone' => '+39 06 9876 1234',
            'subtotal' => 1000.00,
            'tax' => 105.00,
            'total_amount' => 1105.00,
            'payment_method' => 'cash',
            'payment_status' => 'Paid'
        ]);
    }
}
