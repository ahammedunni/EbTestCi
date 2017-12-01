
#!/bin/bash
sudo apt-get install nuget
nuget sources add -NonInteractive -Name MyGet -Source "https://www.myget.org/F/ebtest-nuget/api/v3/index.json" -Verbosity detailed
nuget restore ExpressBase.Core.sln
dotnet build -c Release ./ExpressBase.Web/ExpressBase.Web.csproj