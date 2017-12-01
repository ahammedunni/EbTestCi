
#!/bin/bash
wget https://dist.nuget.org/win-x86-commandline/latest/nuget.exe
chmod 755 nuget.exe
./nuget.exe sources add -NonInteractive -Name MyGet -Source "https://www.myget.org/F/ebtest-nuget/api/v3/index.json" -Verbosity detailed
./nuget.exe restore ExpressBase.Core.sln
dotnet build -c Release ./ExpressBase.Web/ExpressBase.Web.csproj