
#!/bin/bash
nuget sources add -NonInteractive -Name ebtest-nuget -Source "https://www.myget.org/F/ebtest-nuget/api/v3/index.json" -Verbosity detailed
dotnet restore ./ExpressBase.Web/ExpressBase.Web.csproj
dotnet build -c Release ./ExpressBase.Web/ExpressBase.Web.csproj