import { type Page } from '@playwright/test';
import { OrderHistoryPage } from '../../../pages/engage-ads/feature-order-history/OrderHistoryPage';
// import { measurePageLoad } from '../page-performance';

export async function goToOrderHistory(page: Page): Promise<OrderHistoryPage> {
  const orderHistory = new OrderHistoryPage(page);
  // await measurePageLoad(
  //   async () => {
  //     await orderHistory.navigate();
  //     await orderHistory.waitForReady();
  //   },
  //   'OrderHistory',
  // );
  await orderHistory.navigate();
  await orderHistory.waitForReady();
  return orderHistory;
}

export async function goToOrderHistoryAndExpectOrders(page: Page): Promise<OrderHistoryPage> {
  const orderHistory = await goToOrderHistory(page);
  await orderHistory.expectOrderTableVisible();
  await orderHistory.expectAtLeastOneOrder();
  return orderHistory;
}
