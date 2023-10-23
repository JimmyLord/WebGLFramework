mkdir build

copy index-min.html build\index.html

java -jar closure.jar ^
--compilation_level ADVANCED_OPTIMIZATIONS ^
--js ..\build\src\datatypes\pool.js ^
--js ..\build\src\datatypes\color.js ^
--js ..\build\src\datatypes\vector.js ^
--js ..\build\src\datatypes\matrix.js ^
--js ..\build\src\gl\shader.js ^
--js ..\build\src\gl\texture.js ^
--js ..\build\src\datatypes\material.js ^
--js ..\build\src\gl\mesh.js ^
--js ..\build\src\gl\meshdynamic.js ^
--js ..\build\src\core\resourcemanager.js ^
--js ..\build\src\core\camera.js ^
--js ..\build\src\datatypes\light.js ^
--js ..\build\src\core\entity.js ^
--js ..\build\src\core\scene.js ^
--js ..\build\src\imgui\imgui.js ^
--js ..\build\src\core\frameworkmain.js ^
--js ..\build\test\src\main.js ^
--js_output_file build\webgltest.js

pause