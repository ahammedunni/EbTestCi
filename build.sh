#!/bin/bash
set -ev
nuget sources add -NonInteractive -Name MyGet -Source "https://www.myget.org/F/ebtest-nuget/api/v3/index.json"

dotnet restore ExpressBase.Core.sln --configfile /home/travis/.config/NuGet/NuGet.Config

dotnet build -c Release ./ExpressBase.Web/ExpressBase.Web.csproj
dotnet build -c Release ./ExpressBase.ServiceStack/ExpressBase.ServiceStack.csproj