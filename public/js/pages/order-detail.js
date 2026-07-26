const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    if (!Auth.requireAuth()) return {};

    const el = document.getElementById('app');
    const orderId = el.dataset.orderId;
    const paymentResult = ref(el.dataset.paymentResult || null);

    const order = ref(null);
    const loading = ref(true);
    const paying = ref(false);
    const querying = ref(false);

    const statusMap = {
      pending: { label: '待付款' },
      paid: { label: '已付款' },
      failed: { label: '付款失敗' },
    };

    const paymentMessages = {
      success: { text: '付款成功！感謝您的購買。', cls: 'bg-moss' },
      failed: { text: '付款失敗，請重試。', cls: 'bg-stamp' },
      cancel: { text: '付款已取消。', cls: 'bg-gold-thread' },
      querying: { text: '正在查詢付款結果...', cls: 'bg-ink' },
    };

    async function handleEcpay() {
      if (!order.value || paying.value) return;
      paying.value = true;
      try {
        const res = await apiFetch('/api/orders/' + order.value.id + '/payment', {
          method: 'POST'
        });
        const { action_url, params } = res.data;

        // 動態建立表單並自動提交至綠界
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = action_url;
        for (const [key, value] of Object.entries(params)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      } catch (e) {
        Notification.show('產生付款表單失敗', 'error');
        paying.value = false;
      }
    }

    async function handleQueryPayment() {
      if (!order.value || querying.value) return;
      querying.value = true;
      paymentResult.value = 'querying';
      try {
        const res = await apiFetch('/api/orders/' + order.value.id + '/payment/query', {
          method: 'POST'
        });
        order.value = res.data;
        if (res.data.status === 'paid') {
          paymentResult.value = 'success';
        } else if (res.data.status === 'failed') {
          paymentResult.value = 'failed';
        } else {
          paymentResult.value = null;
          Notification.show(res.message || '尚未完成付款，請稍後再查詢', 'info');
        }
      } catch (e) {
        paymentResult.value = null;
        Notification.show('查詢付款結果失敗', 'error');
      } finally {
        querying.value = false;
      }
    }

    // 模擬付款（開發用）
    async function simulatePay(action) {
      if (!order.value || paying.value) return;
      paying.value = true;
      try {
        const res = await apiFetch('/api/orders/' + order.value.id + '/pay', {
          method: 'PATCH',
          body: JSON.stringify({ action })
        });
        order.value = res.data;
        paymentResult.value = action === 'success' ? 'success' : 'failed';
      } catch (e) {
        Notification.show('付款處理失敗', 'error');
      } finally {
        paying.value = false;
      }
    }

    function handlePaySuccess() { simulatePay('success'); }
    function handlePayFail() { simulatePay('fail'); }

    onMounted(async function () {
      try {
        const res = await apiFetch('/api/orders/' + orderId);
        order.value = res.data;

        // 從綠界回導時自動查詢付款結果
        if (paymentResult.value === 'callback' && order.value.status === 'pending') {
          handleQueryPayment();
        }
      } catch (e) {
        Notification.show('載入訂單失敗', 'error');
      } finally {
        loading.value = false;
      }
    });

    return {
      order, loading, paying, querying,
      paymentResult, statusMap, paymentMessages,
      handleEcpay, handleQueryPayment,
      handlePaySuccess, handlePayFail
    };
  }
}).mount('#app');
