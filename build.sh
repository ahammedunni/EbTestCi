
#!/bin/bash
# sudo apt-get install mono-complete
# wget https://dist.nuget.org/win-x86-commandline/latest/nuget.exe
# chmod 755 nuget.exe
nuget sources add -NonInteractive -Name MyGet -Source "https://www.myget.org/F/ebtest-nuget/" -Verbosity detailed
cat /home/travis/.config/NuGet/NuGet.Config
nuget restore ExpressBase.Core.sln -configfile "/home/travis/.config/NuGet/NuGet.Config"
dotnet build -c Release ./ExpressBase.Web/ExpressBase.Web.csproj