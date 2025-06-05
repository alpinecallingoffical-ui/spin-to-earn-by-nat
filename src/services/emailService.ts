
import emailjs from '@emailjs/browser';

interface WithdrawalEmailData {
  to_email: string;
  to_name: string;
  withdrawal_amount: string;
  rupee_amount: string;
  esewa_number: string;
  date: string;
}

export class EmailService {
  private static SERVICE_ID = 'service_qn2iw71';
  private static TEMPLATE_ID = 'template_4zqy0w2';
  private static PUBLIC_KEY = 'mJPtoHuXGjLbMOGj8';

  static async sendWithdrawalApprovalEmail(data: WithdrawalEmailData): Promise<boolean> {
    try {
      const templateParams = {
        to_email: data.to_email,
        to_name: data.to_name,
        subject: '💰 Withdrawal Approved - Your Money is on the Way!',
        withdrawal_amount: data.withdrawal_amount,
        rupee_amount: data.rupee_amount,
        esewa_number: data.esewa_number,
        date: data.date,
        company_name: 'SpinWin',
        support_email: 'support@spinwin.com'
      };

      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams,
        this.PUBLIC_KEY
      );

      console.log('Email sent successfully:', response);
      return response.status === 200;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}
