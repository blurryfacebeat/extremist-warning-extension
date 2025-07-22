const params = new URLSearchParams(location.search);
const url = params.get('original');

const target = document.getElementById('target');
if (target) {
  target.textContent = url ?? 'неизвестный адрес';
}
