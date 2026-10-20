@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Atualizando a base com o arquivo IPTU mais novo da pasta Downloads...
py -m iptu_cep local --atualizar
pause
