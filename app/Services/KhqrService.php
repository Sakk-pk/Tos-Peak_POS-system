<?php

namespace App\Services;

use Carbon\Carbon;

/**
 * KhqrService — Builds a valid EMVCo-compliant Bakong KHQR string manually.
 *
 * This follows the same approach as the working bakong_payway project:
 * it constructs the TLV (Tag-Length-Value) string directly and computes
 * the CRC16-CCITT checksum itself, without relying on the khqr-gateway library
 * for string generation (which can produce incompatible results).
 */
class KhqrService
{
    protected string $merchantId;
    protected string $merchantName;
    protected string $merchantCity;
    protected string $storeName;
    protected string $merchantMobile;
    protected string $bankName;
    protected string $terminalLabel;

    public function __construct()
    {
        $this->merchantId     = config('bakong.account_id',      'mok_chytasenasak@bkrt');
        $this->merchantName   = config('bakong.merchant_name',   'MOK CHYTASENASAK');
        $this->merchantCity   = config('bakong.merchant_city',   'Phnom Penh');
        $this->storeName      = config('bakong.store_name',      'Tos Peak');
        $this->merchantMobile = config('bakong.merchant_mobile', '015859759');
        $this->bankName       = config('bakong.bank_name',       'Bakong');
        $this->terminalLabel  = config('bakong.terminal_label',  'POS-01');
    }

    /**
     * Generate a dynamic KHQR string and its MD5 hash.
     *
     * @param float  $amount
     * @param string $currency  'USD' or 'KHR'
     * @param string $billNumber
     * @return array{ qr: string, md5: string }
     */
    public function generateDynamicKhqr(float $amount, string $currency, string $billNumber): array
    {
        // Dynamic timestamps: now (ms) and now+10min (ms) for Tag 99
        $nowMs    = (int) floor(microtime(true) * 1000);
        $expireMs = $nowMs + (10 * 60 * 1000);

        $qr = $this->buildKhqrString(
            invoiceNumber: $billNumber,
            amount:        $amount,
            currency:      strtoupper($currency),
            tag99_00:      (string) $nowMs,
            tag99_01:      (string) $expireMs,
        );

        return [
            'qr'  => $qr,
            'md5' => md5($qr),
        ];
    }

    /**
     * Build the full KHQR EMVCo TLV string.
     */
    private function buildKhqrString(
        string $invoiceNumber,
        float  $amount,
        string $currency,
        string $tag99_00,
        string $tag99_01,
    ): string {
        $q = '';

        // Tag 00 — Payload Format Indicator
        $q .= $this->tlv('00', '01');

        // Tag 01 — Point of Initiation Method (12 = Dynamic)
        $q .= $this->tlv('01', '12');

        // Tag 29 — Merchant Account Information (Bakong individual)
        $merchantAccount = $this->tlv('00', $this->merchantId);
        $q .= $this->tlv('29', $merchantAccount);

        // Tag 52 — Merchant Category Code (5999 = Misc Retail)
        $q .= $this->tlv('52', '5999');

        // Tag 53 — Transaction Currency (840=USD, 116=KHR)
        $currencyCode = ($currency === 'KHR') ? '116' : '840';
        $q .= $this->tlv('53', $currencyCode);

        // Tag 54 — Transaction Amount (integer for KHR, 2-decimal for USD)
        $amountStr = ($currency === 'KHR')
            ? (string) (int) round($amount)
            : number_format($amount, 2, '.', '');
        $q .= $this->tlv('54', $amountStr);

        // Tag 58 — Country Code
        $q .= $this->tlv('58', 'KH');

        // Tag 59 — Merchant Name
        $q .= $this->tlv('59', $this->merchantName);

        // Tag 60 — Merchant City
        $q .= $this->tlv('60', $this->merchantCity);

        // Tag 62 — Additional Data Field Template
        //   Subtag 01: Bill / Invoice Number
        //   Subtag 02: Mobile / Merchant ID
        //   Subtag 03: Store Name
        //   Subtag 07: Terminal ID
        $additional  = $this->tlv('01', $invoiceNumber);
        $additional .= $this->tlv('02', $this->merchantMobile);
        $additional .= $this->tlv('03', $this->storeName);
        $additional .= $this->tlv('07', $this->terminalLabel);
        $q .= $this->tlv('62', $additional);

        // Tag 99 — Merchant Proprietary Template (timestamps for 10-min expiry)
        $tag99  = $this->tlv('00', $tag99_00);
        $tag99 .= $this->tlv('01', $tag99_01);
        $q .= $this->tlv('99', $tag99);

        // Tag 63 — CRC16 Checksum
        $q .= '6304';
        $q .= $this->crc16($q);

        return $q;
    }

    /**
     * Format a single EMVCo TLV (Tag-Length-Value) block.
     */
    private function tlv(string $tag, string $value): string
    {
        $length = str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT);
        return $tag . $length . $value;
    }

    /**
     * CRC16-CCITT checksum (polynomial 0x1021, seed 0xFFFF).
     * Returns uppercase 4-character hex string (e.g. "AB3F").
     */
    private function crc16(string $str): string
    {
        $crc = 0xFFFF;
        $len = strlen($str);

        for ($c = 0; $c < $len; $c++) {
            $crc ^= ord($str[$c]) << 8;
            for ($i = 0; $i < 8; $i++) {
                if ($crc & 0x8000) {
                    $crc = ($crc << 1) ^ 0x1021;
                } else {
                    $crc = $crc << 1;
                }
            }
        }

        $crc &= 0xFFFF;
        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }
}
