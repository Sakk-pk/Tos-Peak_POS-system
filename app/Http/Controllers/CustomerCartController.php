<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerCartController extends Controller
{
    /**
     * Render the dedicated customer e-commerce shopping cart page.
     */
    public function index(): Response
    {
        return Inertia::render('Storefront/CartPage/CartPage');
    }

    /**
     * Render the dedicated checkout page.
     */
    public function checkout(): Response
    {
        return Inertia::render('Storefront/CheckoutPage/CheckoutPage');
    }

    /**
     * Render the dedicated order success landing page.
     */
    public function success(Request $request): Response
    {
        return Inertia::render('Storefront/OrderSuccessPage/OrderSuccessPage', [
            'orderNumber' => $request->query('order_number'),
            'date' => $request->query('date'),
            'paymentMethod' => $request->query('payment_method'),
            'amount' => $request->query('amount'),
        ]);
    }
}
