function handleDelegate() {
  var pool_id = 'c48ed34a5f24ca6dcbac194e45ed9f0b6ac720018eac038ffa9488bd';
  var blockfrost_project_id = 'mainnetogjsINLvYg8Uqq1kCgZN0DojlVCIg1r6';
  var link =
    'https://armada-alliance.com/delegation-widget?pool_id=' +
    pool_id +
    '&blockfrost_project_id=' +
    blockfrost_project_id;
  var width = 600;
  var height = Math.min(800, parseInt(window.outerHeight, 10));
  var left = parseInt(window.outerWidth, 10) / 2 - width / 2;
  var top = (parseInt(window.outerHeight, 10) - height) / 2;
  window.open(
    link,
    'Delegate',
    'width=' +
      width +
      ',height=' +
      height +
      ',toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1,left=' +
      left +
      ',top=' +
      top
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const delegateBtn = document.querySelector('#delegate');
  delegateBtn.addEventListener('click', handleDelegate);
});
