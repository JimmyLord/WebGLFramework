mkdir build

copy index-min.html build\index.html

java -jar closure.jar ^
--compilation_level ADVANCED_OPTIMIZATIONS ^
--js ..\js\color.js ^
--js ..\js\vector.js ^
--js ..\js\matrix.js ^
--js ..\js\shader.js ^
--js ..\js\texture.js ^
--js ..\js\material.js ^
--js ..\js\mesh.js ^
--js ..\js\resourcemanager.js ^
--js ..\js\camera.js ^
--js ..\js\light.js ^
--js ..\js\entity.js ^
--js ..\js\scene.js ^
--js ..\js\imgui.js ^
--js ..\js\frameworkmain.js ^
--js js\main.js ^
--js_output_file build\webgltest.js

pause