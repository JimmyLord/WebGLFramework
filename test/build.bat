mkdir build

copy index-min.html build\index.html

java -jar closure.jar ^
--compilation_level ADVANCED_OPTIMIZATIONS ^
--js ..\js\datatypes\pool.js ^
--js ..\js\datatypes\color.js ^
--js ..\js\datatypes\vector.js ^
--js ..\js\datatypes\matrix.js ^
--js ..\js\gl\shader.js ^
--js ..\js\gl\texture.js ^
--js ..\js\datatypes\material.js ^
--js ..\js\gl\mesh.js ^
--js ..\js\gl\meshdynamic.js ^
--js ..\js\core\resourcemanager.js ^
--js ..\js\core\camera.js ^
--js ..\js\datatypes\light.js ^
--js ..\js\core\entity.js ^
--js ..\js\core\scene.js ^
--js ..\js\imgui\imgui.js ^
--js ..\js\core\frameworkmain.js ^
--js js\main.js ^
--js_output_file build\webgltest.js

pause