<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class InvitationAcceptedNotification extends Notification
{
    use Queueable;

    public string $email;
    public string $name;
    public string $role;

    public function __construct(string $email, string $name, string $role)
    {
        $this->email = $email;
        $this->name  = $name;
        $this->role  = $role;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Team Invitation Accepted - ' . config('app.name'))
            ->greeting('Hello,')
            ->line("{$this->name} ({$this->email}) has accepted the invitation and joined the team.")
            ->line("Role assigned: {$this->role}")
            ->action('View Team Members', route('users.index'))
            ->line('Thank you for using our application!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'    => 'invitation_accepted',
            'title'   => 'Invitation Accepted',
            'message' => "{$this->name} ({$this->email}) accepted their invitation and joined as {$this->role}.",
            'email'   => $this->email,
            'name'    => $this->name,
            'role'    => $this->role,
        ];
    }
}
