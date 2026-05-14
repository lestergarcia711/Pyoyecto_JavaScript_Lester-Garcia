
const inputclave= document.getElementById("login-clave");
const checkboxMostrar= document.getElementById("mostrar");

checkboxMostrar.addEventListener("change", function() {
    if(this.checked){
        inputclave.type="text";

    }else{
        inputclave.type="password";
    }
});




const usuarioRegistrado = {
    username: "Admin",
    Email: "admincampusparking@gmail.com",
    password: "admin123"
};

localStorage.setItem("usuarioRegistrado", JSON.stringify(usuarioRegistrado));

const formularioLogin = document.getElementById("formulario-login");
const nameInput = document.getElementById("login-usuario");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-clave");
const alertaVisual = document.getElementById("alerta-login");

formularioLogin.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const datosenMemoria = localStorage.getItem("usuarioRegistrado");

    if (datosenMemoria) {
        const usuario = JSON.parse(datosenMemoria);

        if (username === usuario.username && email === usuario.Email && password === usuario.password) {
            // CORRECCIÓN: Usar el nombre exacto de la variable y la propiedad
            alertaVisual.innerHTML = `<p style="color: #2ecc71; background: #1b3d2f; padding: 10px; border-radius: 5px; border: 1px solid #2ecc71;">
                !Bienvenido, ${usuario.username}!
            </p>`;
            
            // Esperamos un momento para que el usuario vea el mensaje
            setTimeout(() => {
                window.location.href = "gestion_vehiculos.html";
            }, 1200);

        } else {
            alertaVisual.innerHTML = `<p style="color: #e74c3c; background: #3d1b1b; padding: 10px; border-radius: 5px; border: 1px solid #e74c3c;">
                Revisa tus credenciales, algo no coincide.
            </p>`;
            
            setTimeout(() => { 
                alertaVisual.innerHTML = ""; 
            }, 2000);
        }
    }
});
 