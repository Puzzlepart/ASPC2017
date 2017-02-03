# HttpTrigger - C<span>#</span>

```
https://crewonboard.azurewebsites.net/api/OnboardCrewmember?name=mikaelsvenon&email=foo@bar.com&group=nebuchadnezzar
```

## How it works

The trigger takes three parameters, name, email and group. The user will then be added to AAD as an external guest and added as a member of the O365 Group specified.
