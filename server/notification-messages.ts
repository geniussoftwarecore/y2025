interface NotificationMessage {
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
}

interface WorkOrderNotificationParams {
  workOrderId: string;
  orderId: string;
}

export function getWorkOrderAssignedMessage(params: WorkOrderNotificationParams): NotificationMessage {
  const shortId = params.orderId.substring(0, 8);
  return {
    titleEn: "New Work Order Assigned",
    titleAr: "تم تعيين أمر عمل جديد",
    messageEn: `You have been assigned work order #${shortId}`,
    messageAr: `تم تعيينك لأمر العمل #${shortId}`,
  };
}

export function getWorkOrderCompletedMessage(params: WorkOrderNotificationParams): NotificationMessage {
  const shortId = params.orderId.substring(0, 8);
  return {
    titleEn: "Work Order Completed",
    titleAr: "اكتمل أمر العمل",
    messageEn: `Work order #${shortId} has been completed and is ready for review`,
    messageAr: `تم إكمال أمر العمل #${shortId} وهو جاهز للمراجعة`,
  };
}

export function getWorkOrderDeliveredMessage(params: WorkOrderNotificationParams): NotificationMessage {
  const shortId = params.orderId.substring(0, 8);
  return {
    titleEn: "Order Delivered",
    titleAr: "تم تسليم الطلب",
    messageEn: `Your work order #${shortId} has been delivered. Thank you for your business!`,
    messageAr: `تم تسليم أمر العمل الخاص بك #${shortId}. شكراً لتعاملكم معنا!`,
  };
}

export function getWorkOrderStartedMessage(params: WorkOrderNotificationParams): NotificationMessage {
  const shortId = params.orderId.substring(0, 8);
  return {
    titleEn: "Work Order Started",
    titleAr: "بدأ تنفيذ أمر العمل",
    messageEn: `Work order #${shortId} is now in progress`,
    messageAr: `أمر العمل #${shortId} قيد التنفيذ الآن`,
  };
}

export function formatNotificationForUser(message: NotificationMessage, preferredLanguage: string): { title: string; message: string } {
  if (preferredLanguage === 'ar') {
    return {
      title: message.titleAr,
      message: message.messageAr,
    };
  }
  return {
    title: message.titleEn,
    message: message.messageEn,
  };
}
