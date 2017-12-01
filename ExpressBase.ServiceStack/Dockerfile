FROM microsoft/aspnetcore
ARG source
WORKDIR /app
EXPOSE 8000
COPY ${source:-obj/Docker/publish} .
ENTRYPOINT ["dotnet", "ExpressBase.ServiceStack.dll"]