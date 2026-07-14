<x-mail::message>
# Welcome to the Team!

You have been invited to join the **{{ config('app.name') }}** staff portal as a **{{ $invitation->role }}**.

To accept this invitation and set up your account credentials, please click the button below:

<x-mail::button :url="$url">
Accept Invitation
</x-mail::button>

*For security reasons, this invitation link is unique, one-time use only, and will expire in **7 days** on {{ $invitation->expires_at->toDayDateTimeString() }}.*

If you did not expect this invitation or believe it was sent in error, you can safely ignore this email.

Best regards,<br>
The {{ config('app.name') }} Team
</x-mail::message>

