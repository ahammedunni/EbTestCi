
#!/bin/bash
# sudo apt-get install mono-complete
# wget https://dist.nuget.org/win-x86-commandline/latest/nuget.exe
# chmod 755 nuget.exe
sudo rm /home/travis/.config/NuGet/NuGet.Config
nuget sources add -NonInteractive -Name MyGet -Source "https://www.myget.org/F/ebtest-nuget/api/v3/"
cat /home/travis/.config/NuGet/NuGet.Config
dotnet restore ExpressBase.Core.sln -configfile /home/travis/.config/NuGet/NuGet.Config
dotnet build -c Release ./ExpressBase.Web/ExpressBase.Web.csproj