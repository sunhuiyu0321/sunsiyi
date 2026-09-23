function login(){
  let user = document.getElementById("login-username").value;
  let pwd = document.getElementById("login-password").value;
  if(user=="202471023" && pwd=="SSYsjy441"){
    alert("登录成功！");
    window.location.href="index.html";
  }else{
    alert("账号或密码错误");
  }
}
