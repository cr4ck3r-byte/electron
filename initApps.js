const child_process = require('child_process');
const { shell, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const latestVersion = require('latest-version');
const extract = require('extract-zip');
const semver = require('semver')


const menuFilesPath = path.join("C:\\filesSys", "menu");
const dashboardFilesPath = path.join("C:\\filesSys", "dashboard-app"); 
const backendFilesPath = path.join("C:\\filesSys", "backend")

// Grupo 1
const initMenuBtn = document.getElementById('initMenu');
const stopMenuBtn = document.getElementById('stopMenu');
const menuContainer = document.getElementById('menu_container');
const btnOpenMenuInBrowser = document.getElementById('btn_open_menu');
let isOn1 = false;//validador 1

// Grupo 2
const initAdminBtn = document.getElementById('initAdmin');
const stopAdminBtn = document.getElementById('stopAdmin');
const adminContainer = document.getElementById('admin_container');
const btnOpenAdminDashbInBrowser = document.getElementById('btn_open_admin')
let isOn2 = false;//validador 2

//Grupo 3
const initBacKBtn = document.getElementById('initBack');
const stopBackBtn = document.getElementById('stopBack');
const backContainer = document.getElementById('back_container');
let isOn3 = false;//validador 3

//Grupo de descargas
const downloadBtn = document.getElementById('downloadBtn')
const menuAppSrc = "https://github.com/cr4ck3r-byte/menuqr-public/raw/main/RestaurapiFiles.zip";
const appPathFiles = path.join("C:\\filesSys");
const ldBar = document.getElementById('myProgress')//Barra de progreso principal
const progressBarInside = document.getElementById("myBar");//Barra de progreso dentro


initMenuBtn.addEventListener('click', () => {// Este bloque pertenece al grupo 1 - Escuchamos evento click del boton iniciar
    if (!fs.existsSync(menuFilesPath)) return;
        
        //validacion
        if (isOn1) return;
        
        //si no esta prendido pasa al siguiente codigo
        const command = child_process.spawn('cmd', ['/c', `serve -s -p 3000 ${menuFilesPath}`]);//ejecutamos el comando para iniciar el servidor
        menuContainer.classList.add("isOn") //añadimos clase css para cambiar estado en el frontend
        isOn1 = true; // cambiamos el validador para no volver a repetir este bloque de codigo
        btnOpenMenuInBrowser.removeAttribute("disabled");//Remuevo el atributo disabled del boton
        
        stopMenuBtn.addEventListener('click', () => { //Escuchamos el evento del boton para detener el servidor
            child_process.spawn("taskkill", ["/pid", command.pid, '/f', '/t']); //ejecutamos el comando para matar el proceso iniciado en la linea 22
            isOn1 = false;//cambiamos el validador para poder volver a iniciar el servidor
            menuContainer.classList.remove("isOn")//Removemos clase de css frontend
            btnOpenMenuInBrowser.setAttribute("disabled", "");        
        })
    });
    
btnOpenMenuInBrowser.addEventListener('click', () => {
    shell.openExternal('http://localhost:3000/?mesa=0')
    })
//final del grupo 1
    
    

initAdminBtn.addEventListener('click', () => {
    if(!fs.existsSync(dashboardFilesPath))return;
    if (isOn2) return; 
    const command = child_process.spawn('cmd', ['/c', `serve -s -p 3002 ${dashboardFilesPath}`]);
    adminContainer.classList.add("isOn") //añadimos clase css para cambiar estado en el frontend
    isOn2 = true;
    btnOpenAdminDashbInBrowser.removeAttribute("disabled");//Remuevo el atributo disabled del boton
    
    stopAdminBtn.addEventListener('click', () => {
        child_process.spawn("taskkill", ["/pid", command.pid, '/f', '/t']);
        isOn2 = false;
        adminContainer.classList.remove("isOn")//Removemos clase de css frontend
        btnOpenAdminDashbInBrowser.setAttribute("disabled", "");        
    })
})

btnOpenAdminDashbInBrowser.addEventListener('click', () => {
    shell.openExternal('http://localhost:3002/')
})


//Grupo 3
initBacKBtn.addEventListener('click', () => {
    if(!fs.existsSync(backendFilesPath))return;
    if (isOn3) return;
    const command = child_process.spawn('cmd', ['/c', `npm start --prefix ${backendFilesPath}`]);
    command.stdout.on('data', data => {
        console.log(data.toString());
    })
    backContainer.classList.add("isOn"); //añadimos clase css para cambiar estado en el frontend
    isOn3 = true;

    stopBackBtn.addEventListener('click', () => {
        child_process.spawn("taskkill", ["/pid", command.pid, '/f', '/t']);
        backContainer.classList.remove("isOn");
        isOn3 = false;
    })
})

downloadBtn.addEventListener('click', async () => {
    const serveLatestVer = await latestVersion('serve');

    const command = child_process.spawn('cmd', ['/c', `npm list -g serve`]);
    command.stdout.on('data', data => {
        let serveCheck = data.toString();
        let isEmpty = serveCheck.split(' ')[1].trim();//trim() delete blank spaces
        if (isEmpty !== "(empty)") {
            let serveVersion = isEmpty.split("@")[1];
            if(semver.lt(serveVersion, serveLatestVer))child_process.spawn('cmd', ['/c', `npm update -g serve`]) //Comprobamos que la version actual sea menor a la ultima version de server npm
        } else {child_process.spawn('cmd', ['/c', `npm i -g serve`])}
    })

    ipcRenderer.send("download", {
        url: menuAppSrc,
        properties: { directory: appPathFiles, overwrite: true}
    });

    ipcRenderer.on('download complete', (event, file) => {

        const extractZip = async () => {
            move(0, " Extrayendo...");
    
            try {
                await extract(file, { dir: appPathFiles })
                    .then(() => {
                        ldBar.classList.remove('off');
                        move(100, " Completado");
                        setTimeout(() => {
                            ldBar.classList.add('off');
                        }, 1000)
                })
            } catch (error) {
                console.log(error);
            }
        }
        extractZip()
    })

    ipcRenderer.on('download progress', (event,progress)=> {
        ldBar.classList.remove('off');
        move(Math.round(progress.percent * 100))
    });
    
});


function move(progress, message = ' Descargando...') { //move load bar
    console.log(progress)
    progressBarInside.style.width = progress + "%";
    progressBarInside.innerHTML = message + progress + "%";
}

//test

// const testBtn = document.getElementById("test");

// testBtn.addEventListener("click", () => {

// })