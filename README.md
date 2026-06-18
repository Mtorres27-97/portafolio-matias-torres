# Portafolio de Matías Torres

Sitio web profesional de **Matías Torres**, enfermero de profesión y desarrollador Fullstack Java en formación. El proyecto presenta su proceso de reinvención profesional, conocimientos actuales, formación, experiencia previa y repositorios públicos.

## Objetivo

Conectar la experiencia del área de la salud con la tecnología para comunicar un perfil profesional orientado al desarrollo de soluciones útiles, accesibles y centradas en las personas.

## Tecnologías

- HTML5 semántico.
- CSS3 con variables, Flexbox, Grid y diseño responsive.
- JavaScript vanilla.
- API pública de GitHub.

El proyecto no necesita npm, Node.js, frameworks ni compilación.

## Estructura

```text
portfolio-matias-torres/
├── index.html
├── README.md
├── .gitignore
└── assets/
    ├── css/
    │   └── style.css
    ├── images/
    │   └── favicon.svg
    └── js/
        └── script.js
```

## Funcionalidades

- Diseño responsive desde 320 px.
- Menú móvil accesible.
- Navegación suave e indicador de sección activa.
- Modo claro y oscuro con persistencia local.
- Respeto por `prefers-reduced-motion`.
- Carga automática de repositorios públicos desde GitHub.
- Caché local y manejo de errores de la API.
- Año del footer actualizado automáticamente.
- Botón para volver arriba.

## Ejecutar localmente

Puedes abrir `index.html` directamente, aunque para probar todas las funciones se recomienda utilizar un servidor local.

Con Visual Studio Code puedes usar la extensión **Live Server**. También puedes ejecutar:

```bash
python -m http.server 8000
```

Luego abre:

```text
http://localhost:8000
```

## Datos configurables

El usuario de GitHub se encuentra al inicio de `assets/js/script.js`:

```javascript
const GITHUB_USERNAME = "Mtorres27-97";
```

El correo no se publica porque todavía debe ser confirmado.

## Enlaces profesionales

- GitHub: https://github.com/Mtorres27-97
- LinkedIn: https://www.linkedin.com/in/matias-torres-3178851a4/

## Publicar con GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube el contenido del proyecto conservando la estructura.
3. Abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/ (root)`.
6. Guarda y espera la publicación.

## Estado

Proyecto en evolución. Se actualizará a medida que Matías avance en su formación y publique nuevos trabajos.
