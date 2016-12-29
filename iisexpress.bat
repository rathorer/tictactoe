SET EX="C:\Program Files (x86)\IIS Express\iisexpress.exe"
if not "%1" == "" (
CALL %EX% /path:"%CD% /port:3000" 
) else (
CALL %EX% /path:"%CD%" /port:3000
)