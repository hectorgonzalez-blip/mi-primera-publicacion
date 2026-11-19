# Deployment Explorer

Dashboard local en español construido con los datos del documento suministrado, verificados el 18 de noviembre de 2026.

Abre `index.html` en un navegador moderno. No necesita instalación, servidor ni conexión a internet para funcionar; los enlaces oficiales requieren conexión.

El archivo `index.html` es autónomo: incluye los estilos, el código y los datos. Los archivos `app.js`, `styles.css` y `datos.json` son las fuentes editables.

Incluye filtros, selección de hasta tres plataformas, comparación detallada, matriz de capacidades, barras apiladas, perfiles de crecimiento, costos, fuentes y un asistente de tres preguntas. El asistente evita recomendar automáticamente cuando se indican datos sensibles o requisitos empresariales de seguridad y auditoría.

Los estados describen dónde vive cada capacidad, no una nota de calidad. Los filtros de uso y administración interpretan las reglas orientativas del documento. Las recomendaciones se calculan sobre las seis plataformas; los filtros limitan la exploración y los gráficos.

Para actualizar los datos, edita `datos.json` y ejecuta `python actualizar.py`. La interfaz no necesita modificarse. Conserva el esquema, los identificadores de plataformas y los seis estados originales. Revisa también la matriz y las reglas orientativas si cambia el significado de las capacidades.

## Comprobaciones opcionales

Para ejecutar las pruebas de navegación, instala las herramientas de desarrollo con `npm install`, prepara el navegador con `npx playwright install chromium` y ejecuta `npm test`. También puedes utilizar un navegador instalado estableciendo `PLAYWRIGHT_CHANNEL` como `msedge` o `chrome`. La aplicación no necesita estas herramientas para funcionar.
