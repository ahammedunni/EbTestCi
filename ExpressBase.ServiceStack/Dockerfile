FROM microsoft/aspnetcore:2.0.3
ARG source
WORKDIR /app
EXPOSE 8000
COPY ${source:-obj/Docker/publish/ebss} .
ENTRYPOINT ["dotnet", "ExpressBase.ServiceStack.dll"]
